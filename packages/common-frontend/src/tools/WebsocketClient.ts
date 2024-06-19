import { TIncomeEvent } from "../../../liquidity-manager-frontend/src/components/Quotes/QuotesDataSource";
import { message } from "antd";

enum WsErrorCodes {
  InvalidJson = 4000,
  ErrorMessage = 4001,
}

export class WebsocketClient {
  private socket: WebSocket | null;
  private reconnectTimeout: number | undefined;
  private readonly worker: null | string;

  private readonly closeHandler: (event: CloseEvent) => void;
  private readonly openHandler: () => void;
  private readonly messageHandler: (msg: TIncomeEvent) => void;

  constructor({
    worker,
    onOpen,
    onMessage,
    onClose,
  }: {
    worker: null | string;
    onOpen: () => void;
    onMessage: (msg: TIncomeEvent) => void;
    onClose?: (event: CloseEvent) => void;
  }) {
    this.worker = worker;
    this.closeHandler = onClose || (() => {});
    this.openHandler = onOpen;
    this.messageHandler = onMessage;

    this.connect();
  }

  private connect() {
    const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${wsProtocol}//${location.host}/ws/${this.worker || 'primary'}/quotes`;
    console.log(`QuotesDataSocket: connecting to ${url}...`);
    this.socket = new WebSocket(url);
    this.socket.addEventListener("open", this.onOpen);
    this.socket.addEventListener("message", this.onMessage);
    this.socket.addEventListener("error", this.onError);
    this.socket.addEventListener("close", this.onClose);
  }

  private onError = (event: WebSocketEventMap['error']) => {
    console.error(`QuotesDataSocket: error for ${this.worker || 'primary'} socket:`);
    console.error(event);
    this.socket?.close();
  }

  private onClose = (event: WebSocketEventMap['close']) => {
    console.log(`QuotesDataSocket: ${this.worker || 'primary'} socket closed`);
    this.socket?.removeEventListener("close", this.onClose);
    this.socket?.removeEventListener("error", this.onError);
    this.socket?.removeEventListener("message", this.onMessage);
    this.socket?.removeEventListener("open", this.onOpen);
    this.socket = null;
    this.closeHandler(event);
  }

  private onOpen = () => {
    this.openHandler();
  }

  private onMessage = async (event: WebSocketEventMap['message']) => {
    let msg: TIncomeEvent;

    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      console.error(`Error, while parsing message from WS server ${event.data}`);
      console.error(e);
      this.socket?.close(WsErrorCodes.InvalidJson, "Invalid JSON");
      return;
    }

    if (msg.event === "error") {
      console.error(`Error from WS server: ${msg.data.message}`);
      this.socket?.close(WsErrorCodes.ErrorMessage, msg.data.message);
      await message.error(`WS server error: ${msg.data.message}`);
      return;
    }


    this.messageHandler(msg);
  }

  public close(): Promise<void> {
    clearTimeout(this.reconnectTimeout);
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.socket?.addEventListener("close", () => resolve(), { once: true });
      this.socket?.close();
    });
  }

  public reconnect(timeout: number) {
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, timeout) as unknown as number;
  }

  public send<T>(data: T) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn(`QuotesDataSocket: socket is not ready to send data`);
      return;
    }

    try {
      this.socket?.send(JSON.stringify(data));
    } catch (e) {
      console.error(`QuotesDataSocket: error, while sending data to WS server`);
      console.error(e);
    }
  }
}
