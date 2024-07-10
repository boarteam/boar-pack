import { Injectable, Logger } from "@nestjs/common";
import { Subject, } from "rxjs";
import { MessageEventDto } from "./dto/quotes.dto";
import { WebSocket } from "ws";
import { QuotesAmtsConnector } from "./quotes.amts-connector";

@Injectable()
export class QuotesProxy {
  private readonly logger = new Logger(QuotesProxy.name);
  private readonly messagesStreamsByClients = new Map<WebSocket, Subject<MessageEventDto>>();

  constructor(
    private readonly amtsConnector: QuotesAmtsConnector,
  ) {}

  public async getMessagesStream(client: WebSocket, symbols: string[]): Promise<Subject<MessageEventDto>> {
    const existingStream = this.messagesStreamsByClients.get(client);
    if (existingStream) {
      this.amtsConnector.stopMessagesStream(existingStream);
    }

    const messagesStream = await this.amtsConnector.getMessagesStream(symbols);
    this.messagesStreamsByClients.set(client, messagesStream);

    // this.pricesSubscriptionsByClients.set(client, subscription);
    client.on('close', () => {
      this.logger.log(`Stopping messages stream since client is closed`);
      this.amtsConnector.stopMessagesStream(messagesStream);
      this.messagesStreamsByClients.delete(client);
    });

    return messagesStream;
  }

  public async updateMessagesStream(client: WebSocket, symbols: string[]) {
    const messagesStream = this.messagesStreamsByClients.get(client);
    if (!messagesStream) {
      throw new Error('Messages stream is not found while trying to update it');
    }
    await this.amtsConnector.updateMessagesStream(messagesStream, symbols);
  }
}
