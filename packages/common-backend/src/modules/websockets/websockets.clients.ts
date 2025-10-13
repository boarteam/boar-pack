import { Injectable, Logger, Scope } from "@nestjs/common";
import WebSocket from "ws";
import { isSafeNumber, parse } from "lossless-json";

export type TBaseConfig<EventType> = {
  url: string;
  onOpen?: () => void;
  onMessage?: (event: EventType) => void;
  onClose?: () => void;
  getEventError?: (event: EventType) => string | null | undefined;
  reconnectTimeout?: number;
  ignoreInvalidJson?: boolean;
};

export enum WsErrorCodes {
  ConnectionClosed = 1000,
  InvalidJson = 4000,
  ErrorMessage = 4001,
  Unauthorized = 4003,
}

@Injectable({ scope: Scope.TRANSIENT })
export class WebsocketsClients<IncomeEventType,
  OutgoingEventType = any,
  ConfigType extends TBaseConfig<IncomeEventType> = TBaseConfig<IncomeEventType>,
  > {
  private readonly logger = new Logger(WebsocketsClients.name);
  private readonly clients = new WeakMap<WebSocket, ConfigType>();

  constructor() {
  }

  private toSafeNumberOrString(value: string): number | string {
    return isSafeNumber(value) ? parseFloat(value) : value;
  }

  public connect(config: ConfigType): WebSocket {
    this.logger.log(`Connecting to ${config.url}...`);
    const ws = new WebSocket(config.url);

    this.clients.set(ws, config);

    ws.on('open', async () => {
      this.logger.log(`Connected to ${config.url}`);
      try {
        await config.onOpen?.();
      } catch (e) {
        this.logger.error(`Error, while calling onOpen for ${config.url} socket`);
        this.logger.error(e);
        ws.close(WsErrorCodes.ErrorMessage, e.toString());
      }
    });

    ws.on('error', (error) => {
      this.logger.error(`Error for ${config.url} socket:`);
      this.logger.error(error);
      ws.close();
    });

    ws.on('close', (code, reason) => {
      this.onClose(ws, config, code, reason);
    });

    ws.on('message', (msg: Buffer) => {
      let event: IncomeEventType;
      try {
        const str = String(msg);
        this.logger.verbose(str);
        event = parse(str, null, this.toSafeNumberOrString) as IncomeEventType;
      } catch (e) {
        this.logger.error(`Error, while parsing message from WS server ${msg}`);
        this.logger.error(e, e.stack);
        if (!config.ignoreInvalidJson) {
          ws?.close(WsErrorCodes.InvalidJson, "Invalid JSON");
        }
        return;
      }

      const errorMessage = config.getEventError?.(event);
      if (errorMessage) {
        this.logger.error(`Error from WS server: ${errorMessage}`);
        ws.close(WsErrorCodes.ErrorMessage, errorMessage);
        return;
      }

      config.onMessage?.(event);
    });

    return ws;
  }

  private onClose(ws: WebSocket, config: ConfigType | undefined, code: number, reason: Buffer) {
    this.logger.log(`${config?.url} socket closed with code ${code} and reason: ${reason.toString()}`);
    ws.removeAllListeners();
    config?.onClose?.();
    this.clients.delete(ws);
  }

  public close(client: WebSocket): Promise<void> {
    const config = this.clients.get(client);
    if (typeof config?.reconnectTimeout === "number") {
      clearTimeout(config.reconnectTimeout);
    }

    if (client.readyState === WebSocket.CLOSED) {
      this.onClose(client, config, WsErrorCodes.ConnectionClosed, Buffer.from("Closed by client"));
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      client.once('close', () => resolve());
      client.close();
    });
  }

  public reconnect(client: WebSocket, timeout: number) {
    const config = this.clients.get(client);
    if (!config) {
      throw new Error(`Can't reconnect, config not found`);
    }

    config.reconnectTimeout = setTimeout(() => {
      this.connect(config);
    }, timeout) as unknown as number;
  }

  public send(client: WebSocket, data: OutgoingEventType): Promise<void> {
    return new Promise((resolve, reject) => {
      const send = () => {
        client.send(JSON.stringify(data), (err) => {
          if (err) {
            this.logger.error(`Error sending data to WS server`);
            this.logger.error(err);
            reject(err);
            return;
          }

          resolve();
        });
      }

      if (client.readyState !== WebSocket.OPEN) {
        const timeout = setTimeout(() => {
          reject(new Error(`Can't send data to WS server, because client is not connected`));
        }, 1000);

        client.once('open', () => {
          clearTimeout(timeout);
          send();
        });

        return;
      }

      try {
        send();
      } catch (e) {
        this.logger.error(`Error, while sending data to WS server`);
        this.logger.error(e);
        reject(e);
      }
    });
  }
}
