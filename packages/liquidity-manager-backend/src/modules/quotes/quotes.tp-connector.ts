import { Injectable, Logger } from "@nestjs/common";
import { TpDcService } from "../tp-dc/tp-dc.service";
import { mtPlatformsIds, MTVersions } from "../tp-dc/tp-dc.constants";
import { CLOSED_OBSERVABLE, MessagesStream } from "./dto/quotes.dto";
import { MTPositionsWSMessage, MTQuoteWSMessage, MTWSMessage } from "../tp-dc/dto/tp-dc.dto";
import { Subject } from "rxjs";
import WebSocket from "ws";
import { PositionSide } from "../positions/dto/positions.dto";

type TConnectorConfig = {
  instruments: string[];
  moduleId: number;
  socket?: WebSocket;
}

@Injectable()
export class QuotesTpConnector {
  private readonly logger = new Logger(QuotesTpConnector.name);
  private readonly subjectsToConfigs = new Map<MessagesStream, TConnectorConfig>();

  constructor(
    private readonly tpDcService: TpDcService,
  ) {
  }

  private getWsUrl({
    moduleId,
    login,
    pass,
  }: {
    moduleId: number,
    login: string,
    pass: string,
  }): string {
    // return `ws://localhost:4300`;
    const baseUri = `ws://tp-tst-srv-01:3000/stream`;
    const searchParams = new URLSearchParams({
      web_api_login: login,
      web_api_pass: pass,
      server_id: moduleId.toString(),
    });
    return `${baseUri}?${searchParams.toString()}`;
  }

  public async getMessagesStream(instruments: string[], moduleId: number): Promise<MessagesStream> {
    const messagesStream: MessagesStream = new Subject();
    const config: TConnectorConfig = {
      instruments,
      moduleId,
    };
    this.subjectsToConfigs.set(messagesStream, config);

    this.logger.log(`Connecting TP socket to new messages stream...`);
    this.connectWebsocketToStream(messagesStream).catch(e => {
      this.logger.error(`Error while connecting to TP websocket`);
      this.logger.error(e, e.stack);
      this.stopMessagesStream(messagesStream).catch(e => {
        this.logger.error(`Error while stopping messages stream`);
        this.logger.error(e, e.stack);
      });
    });

    return messagesStream;
  }

  public async stopMessagesStream(messagesStream: MessagesStream): Promise<void> {
    const config = this.subjectsToConfigs.get(messagesStream);
    messagesStream[CLOSED_OBSERVABLE] = true;
    this.subjectsToConfigs.delete(messagesStream);
    if (config?.socket) {
      await this.tpDcService.closeQuotesWebsocket(config.socket).catch(e => {
        this.logger.error(`Error while closing TP websocket`);
        this.logger.error(e, e.stack);
      });
    }
    messagesStream.complete();
  }

  private async connectWebsocketToStream(messagesStream: MessagesStream, reconnectTries: number = 5): Promise<void> {
    this.logger.log(`Connecting to TP websocket...`);
    try {
      const config = this.subjectsToConfigs.get(messagesStream);
      if (!config) {
        throw new Error(`Config not found for stream, can't connect`);
      }

      config.socket = await this.createWebsocketAndConnect(messagesStream, config);
      return;
    } catch (e) {
      if (reconnectTries <= 0) {
        this.logger.error(`Error while reconnecting to TP websocket, no more tries left`);
        this.logger.error(e, e.stack);
        await this.stopMessagesStream(messagesStream);
        return;
      }

      this.logger.error(`Error while reconnecting to TP websocket, reconnect in 5s..`);
      this.logger.error(e, e.stack);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.connectWebsocketToStream(messagesStream, reconnectTries - 1);
    }
  }

  private async createWebsocketAndConnect(messagesStream: MessagesStream, config: TConnectorConfig): Promise<WebSocket> {
    const ws = this.tpDcService.createQuotesWebsocketAndAttachStream({
      url: this.getWsUrl({
        moduleId: config.moduleId,
        login: '123',
        pass: 'REDACTED',
      }),
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

    if (messagesStream[CLOSED_OBSERVABLE]) {
      this.logger.log(`TP websocket closed, but stream is already closed, no need to reconnect`);
      return;
    }

    if (!config) {
      this.logger.error(`Config not found for stream, can't reconnect`);
      this.stopMessagesStream(messagesStream).catch(e => {
        this.logger.error(`Error while stopping messages stream`);
        this.logger.error(e, e.stack);
      });
      return;
    }

    messagesStream.next({
      event: 'status',
      data: {
        status: config.socket?.readyState || WebSocket.CLOSED,
      },
    });

    this.logger.log(`Reconnecting to TP websocket in 1 second...`);

    setTimeout(() => this.connectWebsocketToStream(messagesStream).catch(e => {
      this.logger.error(`Error while reconnecting to TP websocket`);
      this.logger.error(e, e.stack);
      this.stopMessagesStream(messagesStream).catch(e => {
        this.logger.error(`Error while stopping messages stream`);
        this.logger.error(e, e.stack);
      });
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
    } as const;

    this.logger.log(`Detaching quotes stream from existing socket...`);
    await this.tpDcService.detachStream({
      ...params,
      instruments: config.instruments,
    })

    config.instruments = instruments;

    if (moduleId === config.moduleId) {
      this.logger.log(`Attaching quotes stream to existing socket...`);
      await this.tpDcService.attachStream({
        ...params,
        instruments,
        options: {
          platform_id: mtPlatformsIds[MTVersions.MT5],
        },
      });
    } else {
      config.moduleId = moduleId;
      this.logger.log(`Reconnecting to TP websocket with new module id...`);
      this.recreateSocketForMessageStream(messagesStream, 0);
    }
  }

  private processWSMessage(messagesStream: MessagesStream, event: MTWSMessage) {
    if ('quote' in event) {
      this.processQuoteMessage(messagesStream, event);
    } else if ('position' in event) {
      this.processPositionMessage(messagesStream, event);
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

  private processPositionMessage(messagesStream: MessagesStream, msg: MTPositionsWSMessage): void {
    messagesStream.next({
      event: 'position',
      data: {
        id: msg.position.id,
        userId: msg.position.user_id,
        instrument: msg.position.instrument,
        side: msg.position.side as PositionSide,
        amount: msg.position.amount,
        openPrice: msg.position.open_price,
        margin: msg.position.margin,
        profit: msg.position.profit,
        createdAt: new Date(msg.position.ts_create),
        updatedAt: new Date(msg.position.ts_update),
      }
    });
  }
}
