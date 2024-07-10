import { Injectable, Logger } from "@nestjs/common";
import { AmtsDcService } from "../amts-dc/amts-dc.service";
import { mtPlatformsIds, MTVersions } from "../amts-dc/amts-dc.constants";
import { MessagesStream } from "./dto/quotes.dto";
import { MTLoginResult, MTQuoteWSMessage, MTWSMessage } from "../amts-dc/dto/amts-dc.dto";
import { Subject } from "rxjs";
import WebSocket from "ws";

type TConnectorConfig = {
  instruments: string[];
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


  public getUrl(): string {
    // noinspection HttpUrlsUsage
    return `http://amts-tst-srv-01:3000/stream?server_id=server_1`;
  }

  public getWsUrl(): string {
    return `ws://amts-tst-srv-01:54011/stream?server_id=server_1`;
  }

  public async auth(): Promise<MTLoginResult> {
    // todo: fix credentials
    const password = 'password';
    if (!password) {
      throw new Error('Password is required');
    }

    // return this.amtsDcService.auth(this.getUrl(), {
    //   login: 123,
    //   password,
    //   platform_id: mtPlatformsIds[MTVersions.MT5],
    // });

    return {
      daylight: true,
      pin: 123,
      session_id: 123,
      timezone: 123,
      timeserver: 'string',
      volume_div: 123,
      td: 0,
      aes_key_b64: 'string',
      aes_iv_b64: 'string',
      token: 'string',
      token_lifetime: 123,
    } as any;
  }

  public async getMessagesStream(instruments: string[]): Promise<MessagesStream> {
    const messagesStream: MessagesStream = new Subject();
    const config: TConnectorConfig = {
      instruments,
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

  private async connectWebsocketToStream(messagesStream: MessagesStream, reconnectTries: number = 5): Promise<WebSocket> {
    this.logger.log(`Connecting to AMTS websocket...`);
    try {
      const config = this.subjectsToConfigs.get(messagesStream);
      if (!config) {
        throw new Error(`Config not found for stream, can't connect`);
      }

      config.socket = await this.createWebsocketAndConnect(messagesStream, config.instruments);
      return config.socket;
    } catch (e) {
      if (reconnectTries <= 0) {
        this.logger.error(`Error while reconnecting to AMTS websocket, no more tries left`);
        this.logger.error(e, e.stack);
        throw e;
      }

      this.logger.error(`Error while reconnecting to AMTS websocket, reconnect in 5s..`);
      this.logger.error(e, e.stack);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.connectWebsocketToStream(messagesStream, reconnectTries - 1);
    }
  }

  private async createWebsocketAndConnect(messagesStream: MessagesStream, instruments: string[]): Promise<WebSocket> {
    return this.amtsDcService.createQuotesWebsocketAndAttachStream({
      url: this.getWsUrl(),
      auth: await this.auth(),
      instruments,
      options: {
        platform_id: mtPlatformsIds[MTVersions.MT5],
      },
      onMessage: (event) => {
        this.processWSMessage(messagesStream, event);
      },
      onClose: () => {
        if (messagesStream.closed) {
          this.logger.log(`AMTS websocket closed, but stream is already closed, no need to reconnect`);
          return;
        }

        this.logger.log(`Reconnecting to AMTS websocket in 1 second...`);
        setTimeout(() => this.connectWebsocketToStream(messagesStream), 1000);
      },
    });
  }

  public async updateMessagesStream(messagesStream: MessagesStream, instruments: string[]) {
    const config = this.subjectsToConfigs.get(messagesStream);
    if (!config) {
      throw new Error(`Config not found for stream, can't update`);
    }

    if (!config.socket) {
      config.instruments = instruments;
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
    this.logger.log(`Attaching quotes stream to existing socket...`);
    await this.amtsDcService.attachStream({
      ...params,
      instruments,
      options: {
        platform_id: mtPlatformsIds[MTVersions.MT5],
      },
    });
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
