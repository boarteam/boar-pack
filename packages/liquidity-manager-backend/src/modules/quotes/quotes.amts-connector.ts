import { Injectable, Logger } from "@nestjs/common";
import { AmtsDcService } from "../amts-dc/amts-dc.service";
import { mtPlatformsIds, MTVersions } from "../amts-dc/amts-dc.constants";
import { MessagesStream } from "./dto/quotes.dto";
import { MTLoginResult, MTQuoteWSMessage, MTWSMessage } from "../amts-dc/dto/amts-dc.dto";
import { Subject } from "rxjs";
import WebSocket from "ws";

type TConnectorConfig = {
  instruments: string[];
  moduleId: number;
  socket?: WebSocket;
}

@Injectable()
export class QuotesAmtsConnector {
  private readonly logger = new Logger(QuotesAmtsConnector.name);
  private readonly subjectsToConfigs = new Map<MessagesStream, TConnectorConfig>();

  constructor(
    private readonly amtsDcService: AmtsDcService,
  ) {
  }

  private getWsUrl(moduleId: number): string {
    // return `ws://amts-tst-srv-01:54011/stream?server_id=1060`;
    return `ws://amts-tst-srv-01:3000/stream?server_id=${moduleId}`;
  }

  public async auth(): Promise<MTLoginResult> {
    return this.amtsDcService.auth({
      login: 123,
      password: 'QWERTY12345asdfg',
      platform_id: mtPlatformsIds[MTVersions.MT5],
    });
  }

  public async getMessagesStream(instruments: string[], moduleId: number): Promise<MessagesStream> {
    const messagesStream: MessagesStream = new Subject();
    const config: TConnectorConfig = {
      instruments,
      moduleId,
    };
    this.subjectsToConfigs.set(messagesStream, config);

    this.logger.log(`Connecting AMTS socket to new messages stream...`);
    this.connectWebsocketToStream(messagesStream).catch(e => {
      this.logger.error(`Error while connecting to AMTS websocket`);
      this.logger.error(e, e.stack);
      this.stopMessagesStream(messagesStream);
    });

    return messagesStream;
  }

  public stopMessagesStream(messagesStream: MessagesStream): void {
    const config = this.subjectsToConfigs.get(messagesStream);
    messagesStream.complete();
    messagesStream.closed = true;
    this.subjectsToConfigs.delete(messagesStream);
    if (config?.socket) {
      this.amtsDcService.closeQuotesWebsocket(config.socket).catch(e => {
        this.logger.error(`Error while closing AMTS websocket`);
        this.logger.error(e, e.stack);
      });
    }
  }

  private async connectWebsocketToStream(messagesStream: MessagesStream, reconnectTries: number = 5): Promise<void> {
    this.logger.log(`Connecting to AMTS websocket...`);
    try {
      const config = this.subjectsToConfigs.get(messagesStream);
      if (!config) {
        throw new Error(`Config not found for stream, can't connect`);
      }

      config.socket = await this.createWebsocketAndConnect(messagesStream, config);
      return;
    } catch (e) {
      if (reconnectTries <= 0) {
        this.logger.error(`Error while reconnecting to AMTS websocket, no more tries left`);
        this.logger.error(e, e.stack);
        this.stopMessagesStream(messagesStream);
        return;
      }

      this.logger.error(`Error while reconnecting to AMTS websocket, reconnect in 5s..`);
      this.logger.error(e, e.stack);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.connectWebsocketToStream(messagesStream, reconnectTries - 1);
    }
  }

  private async createWebsocketAndConnect(messagesStream: MessagesStream, config: TConnectorConfig): Promise<WebSocket> {
    const ws = this.amtsDcService.createQuotesWebsocketAndAttachStream({
      url: this.getWsUrl(config.moduleId),
      auth: await this.auth(),
      instruments: config.instruments,
      options: {
        platform_id: mtPlatformsIds[MTVersions.MT5],
      },
      onOpen: () => {
        messagesStream.next({
          event: 'status',
          data: {
            status: ws.readyState,
          },
        });
      },
      onMessage: (event) => {
        this.processWSMessage(messagesStream, event);
      },
      onClose: () => {
        this.recreateSocketForMessageStream(messagesStream);
      },
    });

    messagesStream.next({
      event: 'status',
      data: {
        status: ws.readyState,
      },
    });

    return ws;
  }

  private recreateSocketForMessageStream(messagesStream: MessagesStream, timeout: number = 1000) {
    const config = this.subjectsToConfigs.get(messagesStream);

    if (messagesStream.closed) {
      this.logger.log(`AMTS websocket closed, but stream is already closed, no need to reconnect`);
      return;
    }

    if (!config) {
      this.logger.error(`Config not found for stream, can't reconnect`);
      this.stopMessagesStream(messagesStream);
      return;
    }

    messagesStream.next({
      event: 'status',
      data: {
        status: config.socket?.readyState || WebSocket.CLOSED,
      },
    });

    this.logger.log(`Reconnecting to AMTS websocket in 1 second...`);

    setTimeout(() => this.connectWebsocketToStream(messagesStream).catch(e => {
      this.logger.error(`Error while reconnecting to AMTS websocket`);
      this.logger.error(e, e.stack);
      this.stopMessagesStream(messagesStream);
    }), timeout);
  }

  public async updateMessagesStream({
    messagesStream,
    instruments,
    moduleId,
  }: {
    messagesStream: MessagesStream,
    instruments: string[],
    moduleId: number,
  }) {
    const config = this.subjectsToConfigs.get(messagesStream);
    if (!config) {
      throw new Error(`Config not found for stream, can't update`);
    }

    if (!config.socket) {
      config.instruments = instruments;
      config.moduleId = moduleId;
      this.logger.warn(`Socket is not connected, updating instruments and connecting socket to existing stream...`);
      await this.connectWebsocketToStream(messagesStream);
      return;
    }

    const params = {
      ws: config.socket,
      auth: await this.auth(),
    } as const;

    this.logger.log(`Detaching quotes stream from existing socket...`);
    await this.amtsDcService.detachStream({
      ...params,
      instruments: config.instruments,
    })

    config.instruments = instruments;

    if (moduleId === config.moduleId) {
      this.logger.log(`Attaching quotes stream to existing socket...`);
      await this.amtsDcService.attachStream({
        ...params,
        instruments,
        options: {
          platform_id: mtPlatformsIds[MTVersions.MT5],
        },
      });
    } else {
      config.moduleId = moduleId;
      this.logger.log(`Reconnecting to AMTS websocket with new module id...`);
      this.recreateSocketForMessageStream(messagesStream, 0);
    }
  }

  private processWSMessage(messagesStream: MessagesStream, event: MTWSMessage) {
    if ('quote' in event) {
      this.processQuoteMessage(messagesStream, event);
    } else {
      this.logger.warn(`Unknown WS message type for message: ${JSON.stringify(event)}`);
    }
  }

  private processQuoteMessage(messagesStream: MessagesStream, msg: MTQuoteWSMessage): void {
    messagesStream.next({
      event: 'quote',
      data: {
        symbol: msg.quote.instrument,
        bid: msg.quote.bid,
        ask: msg.quote.ask,
        timestamp: msg.quote.ts_msc,
      },
    });
  }
}
