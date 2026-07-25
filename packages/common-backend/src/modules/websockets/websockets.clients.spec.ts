import { Logger } from '@nestjs/common';
import { AddressInfo } from 'node:net';
import WebSocket, { WebSocketServer } from 'ws';
import {
  TBaseConfig,
  WebsocketsClients,
  WsErrorCodes,
} from './websockets.clients';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitUntil(cond: () => boolean, timeoutMs = 5000) {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitUntil timed out');
    }
    await delay(5);
  }
}

describe('WebsocketsClients', () => {
  let wss: WebSocketServer;
  let url: string;
  let service: WebsocketsClients<any>;
  const serverSockets: WebSocket[] = [];
  const clients: WebSocket[] = [];
  // close events are recorded at connection time — a client may close a socket
  // before the test gets a chance to attach a listener
  const serverCloses = new Map<WebSocket, Promise<{ code: number; reason: string }>>();

  beforeAll(async () => {
    Logger.overrideLogger([]);
    wss = new WebSocketServer({ port: 0 });
    await new Promise<void>((resolve) => wss.once('listening', resolve));
    url = `ws://127.0.0.1:${(wss.address() as AddressInfo).port}`;
    wss.on('connection', (socket) => {
      serverSockets.push(socket);
      serverCloses.set(
        socket,
        new Promise((resolve) =>
          socket.once('close', (code, reason) =>
            resolve({ code, reason: reason.toString() }),
          ),
        ),
      );
    });
  });

  beforeEach(() => {
    service = new WebsocketsClients();
  });

  afterEach(async () => {
    for (const client of clients) {
      if (client.readyState !== WebSocket.CLOSED) {
        await new Promise<void>((resolve) => {
          client.once('close', () => resolve());
          client.terminate();
        });
      }
    }
    clients.length = 0;
    for (const socket of serverSockets) {
      socket.terminate();
    }
    serverSockets.length = 0;
    serverCloses.clear();
    // let stray close events settle so no socket handle survives the test
    await delay(25);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  async function connectPair(config: Partial<TBaseConfig<any>> = {}) {
    const before = serverSockets.length;
    let resolveOpen!: () => void;
    const opened = new Promise<void>((r) => (resolveOpen = r));
    const userOnOpen = config.onOpen;
    const client = service.connect({
      ...config,
      url,
      onOpen: () => {
        resolveOpen();
        return userOnOpen?.();
      },
    });
    clients.push(client);
    await opened;
    await waitUntil(() => serverSockets.length > before);
    return { client, server: serverSockets[serverSockets.length - 1] };
  }

  function onServerClose(server: WebSocket) {
    const closed = serverCloses.get(server);
    if (!closed) {
      throw new Error('Unknown server socket');
    }
    return closed;
  }

  describe('connect', () => {
    it('fires onOpen once the connection is established', async () => {
      const { client } = await connectPair();
      expect(client.readyState).toBe(WebSocket.OPEN);
    });

    it('closes with ErrorMessage code when onOpen throws', async () => {
      const before = serverSockets.length;
      const client = service.connect({
        url,
        onOpen: () => {
          throw new Error('open failed');
        },
      });
      clients.push(client);
      await waitUntil(() => serverSockets.length > before);
      const closed = await onServerClose(
        serverSockets[serverSockets.length - 1],
      );
      expect(closed.code).toBe(WsErrorCodes.ErrorMessage);
      expect(closed.reason).toBe('Error: open failed');
    });
  });

  describe('incoming messages', () => {
    it('parses JSON keeping unsafe numbers as strings', async () => {
      let resolveEvent!: (e: any) => void;
      const gotEvent = new Promise<any>((r) => (resolveEvent = r));
      const { server } = await connectPair({ onMessage: resolveEvent });

      server.send(
        '{"event":"num","data":{"big":9123372036854775807,"small":42,"pi":3.14,"str":"1.5"}}',
      );

      expect(await gotEvent).toEqual({
        event: 'num',
        data: {
          // exceeds Number.MAX_SAFE_INTEGER, so it survives as a string
          big: '9123372036854775807',
          small: 42,
          pi: 3.14,
          str: '1.5',
        },
      });
    });

    it('closes with ErrorMessage code when getEventError returns a message', async () => {
      const onClose = jest.fn();
      const onMessage = jest.fn();
      const { server } = await connectPair({
        onClose,
        onMessage,
        getEventError: (event: any) =>
          event.event === 'error' ? event.data : null,
      });
      const closed = onServerClose(server);

      server.send(JSON.stringify({ event: 'error', data: 'boom' }));

      expect(await closed).toEqual({
        code: WsErrorCodes.ErrorMessage,
        reason: 'boom',
      });
      expect(onMessage).not.toHaveBeenCalled();
      await waitUntil(() => onClose.mock.calls.length === 1);
    });

    it('closes with InvalidJson code on unparsable frames by default', async () => {
      const onMessage = jest.fn();
      const { server } = await connectPair({ onMessage });
      const closed = onServerClose(server);

      server.send('this is not json');

      expect(await closed).toEqual({
        code: WsErrorCodes.InvalidJson,
        reason: 'Invalid JSON',
      });
      expect(onMessage).not.toHaveBeenCalled();
    });

    it('keeps the connection open on invalid JSON when ignoreInvalidJson is true', async () => {
      const events: any[] = [];
      const { client, server } = await connectPair({
        ignoreInvalidJson: true,
        onMessage: (e: any) => events.push(e),
      });

      server.send('this is not json');
      server.send(JSON.stringify({ event: 'ok', data: 1 }));

      await waitUntil(() => events.length > 0);
      // the invalid frame is dropped, the valid one still arrives
      expect(events).toEqual([{ event: 'ok', data: 1 }]);
      expect(client.readyState).toBe(WebSocket.OPEN);
    });
  });

  describe('send', () => {
    it('serializes payloads as JSON', async () => {
      const { client, server } = await connectPair();
      const received = new Promise<string>((resolve) =>
        server.once('message', (data) => resolve(String(data))),
      );

      await service.send(client, { event: 'hello', data: { n: 1 } });

      expect(JSON.parse(await received)).toEqual({
        event: 'hello',
        data: { n: 1 },
      });
    });

    it('waits for the connection to open before sending', async () => {
      const before = serverSockets.length;
      const client = service.connect({ url });
      clients.push(client);
      expect(client.readyState).toBe(WebSocket.CONNECTING);

      await service.send(client, { event: 'early' });

      await waitUntil(() => serverSockets.length > before);
      const server = serverSockets[serverSockets.length - 1];
      const received = await new Promise<string>((resolve) =>
        server.once('message', (data) => resolve(String(data))),
      );
      expect(JSON.parse(received)).toEqual({ event: 'early' });
    });

    it('rejects when the client never connects', async () => {
      const { client } = await connectPair();
      await service.close(client);

      await expect(service.send(client, { event: 'late' })).rejects.toThrow(
        "Can't send data to WS server, because client is not connected",
      );
    });
  });

  describe('close', () => {
    it('closes the socket and fires the config onClose', async () => {
      const onClose = jest.fn();
      const { client } = await connectPair({ onClose });

      await service.close(client);

      expect(client.readyState).toBe(WebSocket.CLOSED);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('resolves immediately for an already closed client', async () => {
      const { client } = await connectPair();
      await service.close(client);

      await expect(service.close(client)).resolves.toBeUndefined();
    });
  });

  describe('reconnect', () => {
    it('reconnects after a server-side close', async () => {
      let opens = 0;
      let didReconnect = false;
      let resolveSecondOpen!: () => void;
      const secondOpen = new Promise<void>((r) => (resolveSecondOpen = r));

      const config: TBaseConfig<any> = {
        url,
        onOpen: () => {
          opens += 1;
          if (opens === 2) {
            resolveSecondOpen();
          }
        },
        onClose: () => {
          if (!didReconnect) {
            didReconnect = true;
            service.reconnect(client, 10);
          }
        },
      };
      const client = service.connect(config);
      clients.push(client);
      await waitUntil(() => opens === 1);
      await waitUntil(() => serverSockets.length === 1);

      serverSockets[0].close();

      await secondOpen;
      expect(opens).toBe(2);
      await waitUntil(() => serverSockets.length === 2);
    });

    it('throws for a client without a registered config', async () => {
      const { client } = await connectPair();
      // closing drops the config from the registry
      await service.close(client);

      expect(() => service.reconnect(client, 10)).toThrow(
        "Can't reconnect, config not found",
      );
    });
  });
});
