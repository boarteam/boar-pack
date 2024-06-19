import { Injectable, Logger } from "@nestjs/common";
import { AmtsDcService } from "../amts-dc/amts-dc.service";
import { mtPlatformsIds, MTVersions } from "../amts-dc/amts-dc.constants";
import { MessagesStream } from "./dto/quotes.dto";
import { MTLoginResult, MTQuoteWSMessage, MTWSMessage } from "../amts-dc/dto/amts-dc.dto";
import { Subject } from "rxjs";

@Injectable()
export class QuotesAmtsConnector {
  private readonly logger = new Logger(QuotesAmtsConnector.name);
  private readonly subjectsToConfigs = new Map<MessagesStream, {
    instruments: string[],
  }>();

  constructor(
    private readonly amtsDcService: AmtsDcService,
  ) {
  }


  public getUrl(): string {
    // noinspection HttpUrlsUsage
    return `http://amts-tst-srv-01:3000/stream?server_id=server_1`;
  }

  public getWsUrl(): string {
    return `ws://amts-tst-srv-01:3000/stream?server_id=server_1`;
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
    this.subjectsToConfigs.set(messagesStream, {
      instruments,
    });

    await this.connectWebsocketToStream(messagesStream);
    return messagesStream;
  }

  public stopMessagesStream(messagesStream: MessagesStream): void {
    messagesStream.unsubscribe();
    this.subjectsToConfigs.delete(messagesStream);
  }

  private async connectWebsocketToStream(messagesStream: MessagesStream): Promise<void> {
    this.logger.log(`Connecting to AMTS websocket...`);
    try {
      const config = this.subjectsToConfigs.get(messagesStream);
      if (!config) {
        throw new Error(`Config not found for stream, can't connect`);
      }

      await this.createWebsocketAndConnect(messagesStream, config.instruments);
    } catch (e) {
      this.logger.error(`Error while reconnecting to AMTS websocket, reconnect in 5s..`);
      this.logger.error(e, e.stack);
      setTimeout(() => this.connectWebsocketToStream(messagesStream), 5000);
    }
  }

  private async createWebsocketAndConnect(messagesStream: MessagesStream, instruments: string[]) {
    const socket = this.amtsDcService.getQuotesWebsocket({
      url: this.getWsUrl(),
      auth: await this.auth(),
      instruments,
      options: {
        platform_id: mtPlatformsIds[MTVersions.MT5],
      }
    });

    socket.on('message', async (data: string) => {
      this.logger.verbose(data);
      await this.processWSMessage(messagesStream, data);
    });

    socket.on('close', async () => {
      this.logger.log(`Reconnecting to AMTS websocket in 1 second...`);
      setTimeout(() => this.connectWebsocketToStream(messagesStream), 1000);
    });
  }
  /**
   * volumes array contains negative and positive values, negative values are for ask prices, positive for bid prices.
   * Every volume value corresponds to price value with the same index. Last negative value is for the lowest ask price,
   * last positive value is for the highest bid price. So, to find bid and ask prices we need to find the last negative
   * value and the first positive value.
   */
  private findBidAskPrices(prices: number[], volumes: number[]): { bid: number, ask: number } {
    let bid = 0;
    let ask = 0;
    for (let i = 0; i < volumes.length; i++) {
      const volume = volumes[i];
      if (volume < 0 || Object.is(volume, -0)) {
        ask = prices[i];
      } else {
        bid = prices[i];
        break;
      }
    }
    return { bid, ask };
  }

  private async processWSMessage(messagesStream: MessagesStream, data: string): Promise<void> {
    try {
      const msg: MTWSMessage = JSON.parse(data);
      if ('quote' in msg) {
        this.processQuoteMessage(messagesStream, msg);
      } else {
        this.logger.warn(`Unknown WS message type`);
      }
    } catch (e) {
      this.logger.error(`Error while processing WS message`);
      this.logger.error(data);
      this.logger.error(e, e.stack);
    }
  }

  private processQuoteMessage(messagesStream: MessagesStream, msg: MTQuoteWSMessage): void {
    const { bid, ask } = this.findBidAskPrices(msg.quote.bands.prices, msg.quote.bands.volumes);

    messagesStream.next({
      event: 'quote',
      data: {
        symbol: msg.quote.instrument,
        bid,
        ask,
        timestamp: msg.quote.ts_msc,
      },
    });
  }
}
