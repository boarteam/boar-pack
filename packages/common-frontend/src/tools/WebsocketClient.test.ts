import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { message } from 'antd';
import { WebsocketClient, WsErrorCodes, TIncomeEvent } from './WebsocketClient';

vi.mock('antd', () => ({
  message: {
    error: vi.fn(async () => undefined),
  },
}));

type Listener = (event: any) => void;

class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readonly url: string;
  readyState: number = FakeWebSocket.CONNECTING;

  send = vi.fn();
  close = vi.fn((code?: number, reason?: string) => {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatch('close', { type: 'close', code: code ?? 1000, reason: reason ?? '' });
  });

  private listeners = new Map<string, Set<Listener>>();

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, cb: Listener, options?: { once?: boolean }) {
    let handler: Listener = cb;
    if (options?.once) {
      handler = (event: any) => {
        this.removeEventListener(type, handler);
        cb(event);
      };
    }
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, cb: Listener) {
    this.listeners.get(type)?.delete(cb);
  }

  dispatch(type: string, event: any) {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const cb of [...set]) {
      cb(event);
    }
  }

  // Test helpers simulating server-side activity.
  serverOpen() {
    this.readyState = FakeWebSocket.OPEN;
    this.dispatch('open', { type: 'open' });
  }

  serverMessage(data: unknown) {
    this.dispatch('message', {
      type: 'message',
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  serverError() {
    this.dispatch('error', { type: 'error' });
  }
}

function lastSocket(): FakeWebSocket {
  return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
}

function makeClient(
  overrides: Partial<{
    worker: null | string;
    onOpen: () => void;
    onMessage: (msg: TIncomeEvent) => void;
    onClose: (event: CloseEvent) => void;
  }> = {},
) {
  const onOpen = overrides.onOpen ?? vi.fn();
  const onMessage = overrides.onMessage ?? vi.fn();
  const onClose = overrides.onClose ?? vi.fn();
  const client = new WebsocketClient({
    worker: overrides.worker !== undefined ? overrides.worker : null,
    onOpen,
    onMessage,
    onClose,
  });
  return { client, onOpen, onMessage, onClose };
}

describe('WsErrorCodes', () => {
  it('pins the wire protocol error codes', () => {
    expect(WsErrorCodes.ConnectionClosed).toBe(1000);
    expect(WsErrorCodes.InvalidJson).toBe(4000);
    expect(WsErrorCodes.ErrorMessage).toBe(4001);
    expect(WsErrorCodes.Unauthorized).toBe(4003);
  });
});

describe('WebsocketClient', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('connection URL', () => {
    it('connects immediately to /ws/primary/ws when worker is null', () => {
      makeClient({ worker: null });
      expect(FakeWebSocket.instances).toHaveLength(1);
      expect(lastSocket().url).toBe(`ws://${location.host}/ws/primary/ws`);
    });

    it('uses the worker id in the path when provided', () => {
      makeClient({ worker: 'quotes-worker-3' });
      expect(lastSocket().url).toBe(`ws://${location.host}/ws/quotes-worker-3/ws`);
    });

    it('falls back to primary for an empty-string worker id', () => {
      // worker || 'primary' — any falsy worker (null, '') derives to 'primary'
      makeClient({ worker: '' });
      expect(lastSocket().url).toBe(`ws://${location.host}/ws/primary/ws`);
    });

    it('derives ws: from the http: page protocol', () => {
      expect(location.protocol).toBe('http:');
      makeClient({});
      expect(lastSocket().url.startsWith('ws://')).toBe(true);
    });
  });

  describe('open / status', () => {
    it('invokes onOpen when the socket opens', () => {
      const { onOpen } = makeClient({});
      expect(onOpen).not.toHaveBeenCalled();
      lastSocket().serverOpen();
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('reports CONNECTING until the server reports OPEN via a status frame', () => {
      const { client, onMessage } = makeClient({});
      expect(client.status).toBe(FakeWebSocket.CONNECTING);

      lastSocket().serverOpen();
      // Local socket is open but the server-side status is still CONNECTING.
      expect(client.status).toBe(FakeWebSocket.CONNECTING);

      const statusFrame = {
        event: 'status',
        data: { message: 'ok', status: FakeWebSocket.OPEN },
      };
      lastSocket().serverMessage(statusFrame);

      // Once the server says OPEN, status mirrors the local socket readyState.
      expect(client.status).toBe(FakeWebSocket.OPEN);
      // Status frames are still forwarded to the subscriber.
      expect(onMessage).toHaveBeenCalledWith(statusFrame);
    });
  });

  describe('send', () => {
    it('JSON-serializes the payload when the socket is open', () => {
      const { client } = makeClient({});
      lastSocket().serverOpen();

      client.send({ event: 'subscribe', data: { symbols: ['EURUSD'] } });

      expect(lastSocket().send).toHaveBeenCalledTimes(1);
      expect(lastSocket().send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'subscribe', data: { symbols: ['EURUSD'] } }),
      );
    });

    it('queues the payload until open when the socket is still connecting', () => {
      const { client } = makeClient({});
      client.send({ event: 'subscribe' });

      expect(lastSocket().send).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'QuotesDataSocket: socket is not ready to send data',
      );

      lastSocket().serverOpen();
      expect(lastSocket().send).toHaveBeenCalledTimes(1);
      expect(lastSocket().send).toHaveBeenCalledWith(JSON.stringify({ event: 'subscribe' }));
    });

    it('throws when called after the socket has closed (current behavior)', () => {
      // BUG (documented, not fixed): after a close event this.socket is null,
      // and send() falls into the not-open branch which dereferences
      // this.socket.addEventListener without a null check -> TypeError.
      const { client } = makeClient({});
      lastSocket().serverOpen();
      lastSocket().close();

      expect(() => client.send({ event: 'ping' })).toThrow(TypeError);
    });
  });

  describe('incoming messages', () => {
    it('parses JSON frames and dispatches the typed event to the subscriber', () => {
      const { onMessage } = makeClient({});
      lastSocket().serverOpen();

      const frame = { event: 'quotes', data: { message: 'tick', bid: 1.1, ask: 1.2 } };
      lastSocket().serverMessage(frame);

      expect(onMessage).toHaveBeenCalledTimes(1);
      expect(onMessage).toHaveBeenCalledWith(frame);
    });

    it('closes with InvalidJson (4000) on a non-JSON frame and does not notify the subscriber', () => {
      const { onMessage, onClose } = makeClient({});
      const socket = lastSocket();
      socket.serverOpen();

      socket.serverMessage('not-json{');

      expect(socket.close).toHaveBeenCalledWith(WsErrorCodes.InvalidJson, 'Invalid JSON');
      expect(onMessage).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0][0]).toMatchObject({ code: WsErrorCodes.InvalidJson });
    });

    it('handles a server error frame: closes with 4001, shows antd message.error, invokes the close callback', () => {
      const { onMessage, onClose } = makeClient({});
      const socket = lastSocket();
      socket.serverOpen();

      socket.serverMessage({ event: 'error', data: { message: 'boom' } });

      expect(socket.close).toHaveBeenCalledWith(WsErrorCodes.ErrorMessage, 'boom');
      expect(message.error).toHaveBeenCalledWith('WS server error: boom');
      expect(onMessage).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0][0]).toMatchObject({
        code: WsErrorCodes.ErrorMessage,
        reason: 'boom',
      });
    });
  });

  describe('socket errors and close', () => {
    it('closes the socket on a transport error and calls the close callback', () => {
      const { onClose } = makeClient({});
      const socket = lastSocket();
      socket.serverOpen();

      socket.serverError();

      expect(socket.close).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('close() resolves once the socket has closed', async () => {
      const { client, onClose } = makeClient({});
      lastSocket().serverOpen();

      await expect(client.close()).resolves.toBeUndefined();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('close() resolves immediately when there is no live socket', async () => {
      const { client } = makeClient({});
      lastSocket().close(); // socket nulled by the close event
      await expect(client.close()).resolves.toBeUndefined();
    });
  });

  describe('reconnect', () => {
    it('reconnects after the given timeout', () => {
      vi.useFakeTimers();
      const { client } = makeClient({ worker: 'w1' });
      expect(FakeWebSocket.instances).toHaveLength(1);
      lastSocket().close();

      client.reconnect(3000);
      vi.advanceTimersByTime(2999);
      expect(FakeWebSocket.instances).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(FakeWebSocket.instances).toHaveLength(2);
      expect(lastSocket().url).toBe(`ws://${location.host}/ws/w1/ws`);
    });

    it('close() cancels a pending reconnect', async () => {
      vi.useFakeTimers();
      const { client } = makeClient({});
      lastSocket().close();

      client.reconnect(1000);
      await client.close();

      vi.advanceTimersByTime(10_000);
      expect(FakeWebSocket.instances).toHaveLength(1);
    });
  });
});
