import { Injectable, Logger } from "@nestjs/common";
import { Subject, } from "rxjs";
import { MessageEventDto } from "./dto/quotes.dto";
import { WebSocket } from "ws";
import { QuotesAmtsConnector } from "./quotes.amts-connector";

@Injectable()
export class QuotesProxy {
  private readonly logger = new Logger(QuotesProxy.name);
  // private readonly pricesSubscriptionsByClients = new Map<WebSocket, Subscription>();

  constructor(
    private readonly amtsConnector: QuotesAmtsConnector,
  ) {}

  public async getMessagesStream(client: WebSocket, symbols: string[]): Promise<Subject<MessageEventDto>> {
    // this.pricesSubscriptionsByClients.get(client)?.unsubscribe();
    const messagesStream = await this.amtsConnector.getMessagesStream(symbols);

    // this.pricesSubscriptionsByClients.set(client, subscription);
    client.on('close', () => {
      this.logger.log(`Stopping messages stream since client is closed`);
      this.amtsConnector.stopMessagesStream(messagesStream);
      // this.pricesSubscriptionsByClients.delete(client);
    });

    return messagesStream;
  }
}
