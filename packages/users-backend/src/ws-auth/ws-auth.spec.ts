import 'reflect-metadata';
import { EventEmitter } from 'events';
import { ExecutionContext, Logger } from '@nestjs/common';
import passport from 'passport';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { WsErrorCodes } from '@boarteam/boar-pack-common-backend';
import { SCHEDULE_INTERVAL_OPTIONS } from '@nestjs/schedule/dist/schedule.constants';
import { GATEWAY_OPTIONS } from '@nestjs/websockets/constants';
import { WsAuthService } from './ws-auth.service';
import { WsAuthGuard } from './ws-auth.guard';
import { WsAuthGateway } from './ws-auth.gateway';
import { WS_AUTH_CLIENT_AUTHENTICATED } from './ws-auth.constants';

const STRATEGY = 'test-strategy';

type FakeSocket = EventEmitter & {
  user?: any;
  send: jest.Mock;
  close: jest.Mock;
  ping: jest.Mock;
  terminate: jest.Mock;
};

function createSocket(): FakeSocket {
  const socket = new EventEmitter() as FakeSocket;
  socket.send = jest.fn();
  socket.close = jest.fn();
  socket.ping = jest.fn();
  socket.terminate = jest.fn();
  return socket;
}

describe('ws-auth', () => {
  let loggerSpies: jest.SpyInstance[];

  beforeEach(() => {
    loggerSpies = (['debug', 'warn', 'error'] as const).map((method) =>
      jest.spyOn(Logger.prototype, method).mockImplementation(() => undefined),
    );
  });

  afterEach(() => {
    loggerSpies.forEach((spy) => spy.mockRestore());
    jest.restoreAllMocks();
  });

  describe('WsAuthService', () => {
    let service: WsAuthService;
    let authenticateSpy: jest.SpyInstance;
    // Captured per connection: passport's verify callback and the middleware's
    // completion callback, so tests can drive auth outcomes explicitly.
    let verify: (err: Error | null, user?: any) => void;
    let middlewareNext: (e: Error | null) => void;
    let middleware: jest.Mock;

    beforeEach(() => {
      service = new WsAuthService(STRATEGY);
      middleware = jest.fn((req: any, res: any, next: any) => {
        middlewareNext = next;
      });
      authenticateSpy = jest.spyOn(passport, 'authenticate').mockImplementation(((
        strategy: string,
        cb: any,
      ) => {
        verify = cb;
        return middleware;
      }) as any);
    });

    function connect(socket: FakeSocket): IncomingMessage {
      const req = { url: '/ws' } as IncomingMessage;
      service.handleConnection(socket as unknown as WebSocket, req);
      return req;
    }

    function authenticate(socket: FakeSocket, user: any) {
      connect(socket);
      verify(null, user);
    }

    it('runs the configured passport strategy against the upgrade request', () => {
      const socket = createSocket();
      const req = connect(socket);

      expect(authenticateSpy).toHaveBeenCalledWith(STRATEGY, expect.any(Function));
      expect(middleware).toHaveBeenCalledWith(req, null, expect.any(Function));
    });

    it('attaches the user to the socket and emits the authenticated event on success', async () => {
      const socket = createSocket();
      const authenticated = jest.fn();
      socket.on(WS_AUTH_CLIENT_AUTHENTICATED, authenticated);
      const user = { id: 'user-1' };

      authenticate(socket, user);

      expect(socket.user).toBe(user);
      expect(authenticated).toHaveBeenCalledTimes(1);
      expect(socket.close).not.toHaveBeenCalled();
      await expect(service.finishInitialization(socket as unknown as WebSocket)).resolves.toBe(
        user,
      );
    });

    it('sends an error and closes the socket when the strategy errors', async () => {
      const socket = createSocket();
      connect(socket);

      verify(new Error('boom'));

      expect(socket.send).toHaveBeenCalledWith('Authentication error');
      expect(socket.close).toHaveBeenCalledTimes(1);
      expect(socket.user).toBeUndefined();
      await expect(
        service.finishInitialization(socket as unknown as WebSocket),
      ).resolves.toBeNull();
    });

    it('sends an error and closes the socket when the strategy yields no user', async () => {
      const socket = createSocket();
      connect(socket);

      verify(null, undefined);

      expect(socket.send).toHaveBeenCalledWith('Authentication error');
      expect(socket.close).toHaveBeenCalledTimes(1);
      await expect(
        service.finishInitialization(socket as unknown as WebSocket),
      ).resolves.toBeNull();
    });

    it('resolves null when the passport middleware itself fails', async () => {
      const socket = createSocket();
      connect(socket);

      middlewareNext(new Error('middleware failed'));

      await expect(
        service.finishInitialization(socket as unknown as WebSocket),
      ).resolves.toBeNull();
      expect(socket.close).not.toHaveBeenCalled();
    });

    it('finishInitialization returns null for sockets that never connected', async () => {
      const stranger = createSocket();

      await expect(
        service.finishInitialization(stranger as unknown as WebSocket),
      ).resolves.toBeNull();
    });

    it('broadcasts serialized events to authenticated clients only', () => {
      const authenticatedSocket = createSocket();
      authenticate(authenticatedSocket, { id: 'user-1' });

      const rejectedSocket = createSocket();
      connect(rejectedSocket);
      verify(new Error('nope'));

      const event = { event: 'quotes', data: { bid: 1 } };
      service.broadcast(event);

      expect(authenticatedSocket.send).toHaveBeenCalledWith(
        JSON.stringify(event),
        expect.any(Function),
      );
      expect(rejectedSocket.send).not.toHaveBeenCalledWith(
        JSON.stringify(event),
        expect.any(Function),
      );
    });

    it('stops broadcasting to clients after they disconnect', () => {
      const socket = createSocket();
      authenticate(socket, { id: 'user-1' });

      service.handleDisconnect(socket as unknown as WebSocket);
      service.broadcast({ event: 'tick', data: null });

      expect(socket.send).not.toHaveBeenCalled();
    });

    it('logs send failures without throwing during broadcast', () => {
      const socket = createSocket();
      authenticate(socket, { id: 'user-1' });
      socket.send.mockImplementation((_data: any, cb: (err?: Error) => void) =>
        cb(new Error('pipe broken')),
      );
      const errorSpy = loggerSpies[2];

      expect(() => service.broadcast({ event: 'tick', data: null })).not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith('Error sending event to client: pipe broken');
    });

    describe('client liveness checks', () => {
      function checkClients() {
        (service as any).checkClients();
      }

      it('registers checkClients to run every 5 seconds', () => {
        const metadata = Reflect.getMetadata(
          SCHEDULE_INTERVAL_OPTIONS,
          (WsAuthService.prototype as any).checkClients,
        );
        expect(metadata).toEqual({ timeout: 5000 });
      });

      it('pings clients and keeps the ones that answer with pong', () => {
        const socket = createSocket();
        authenticate(socket, { id: 'user-1' });

        checkClients();
        expect(socket.ping).toHaveBeenCalledTimes(1);
        expect(socket.terminate).not.toHaveBeenCalled();

        socket.emit('pong');

        checkClients();
        expect(socket.ping).toHaveBeenCalledTimes(2);
        expect(socket.terminate).not.toHaveBeenCalled();
      });

      it('terminates and forgets clients that miss a pong between checks', () => {
        const socket = createSocket();
        authenticate(socket, { id: 'user-1' });

        checkClients();
        checkClients();

        expect(socket.terminate).toHaveBeenCalledTimes(1);

        service.broadcast({ event: 'tick', data: null });
        expect(socket.send).not.toHaveBeenCalled();
      });
    });
  });

  describe('WsAuthGuard', () => {
    function createGuard(user: any) {
      const wsAuthService = {
        finishInitialization: jest.fn().mockResolvedValue(user),
      };
      const guard = new WsAuthGuard(wsAuthService as unknown as WsAuthService);
      return { guard, wsAuthService };
    }

    function createContext(client: FakeSocket): ExecutionContext {
      return {
        switchToWs: () => ({ getClient: () => client }),
      } as unknown as ExecutionContext;
    }

    it('activates when the client finished authentication with a user', async () => {
      const client = createSocket();
      const { guard, wsAuthService } = createGuard({ id: 'user-1' });

      await expect(guard.canActivate(createContext(client))).resolves.toBe(true);
      expect(wsAuthService.finishInitialization).toHaveBeenCalledWith(client);
      expect(client.close).not.toHaveBeenCalled();
    });

    it('closes the client with an Unauthorized code and denies unauthenticated clients', async () => {
      const client = createSocket();
      const { guard } = createGuard(null);
      const warnSpy = loggerSpies[1];

      await expect(guard.canActivate(createContext(client))).resolves.toBe(false);
      expect(client.close).toHaveBeenCalledWith(
        WsErrorCodes.Unauthorized,
        'You have been logged out, please login again',
      );
      expect(warnSpy).toHaveBeenCalledWith('Unauthorized connection by websocket');
    });
  });

  describe('WsAuthGateway', () => {
    it('is configured to listen on the /ws path', () => {
      expect(Reflect.getMetadata(GATEWAY_OPTIONS, WsAuthGateway)).toEqual({
        path: '/ws',
      });
    });

    it('delegates connections and disconnections to the service', () => {
      const wsAuthService = {
        handleConnection: jest.fn(),
        handleDisconnect: jest.fn(),
      };
      const gateway = new WsAuthGateway(wsAuthService as unknown as WsAuthService);
      const socket = createSocket() as unknown as WebSocket;
      const req = { url: '/ws' } as IncomingMessage;

      gateway.handleConnection(socket, req);
      expect(wsAuthService.handleConnection).toHaveBeenCalledWith(socket, req);

      gateway.handleDisconnect(socket);
      expect(wsAuthService.handleDisconnect).toHaveBeenCalledWith(socket);
    });
  });
});
