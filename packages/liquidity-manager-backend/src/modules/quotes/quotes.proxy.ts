import { Injectable, Logger } from "@nestjs/common";
import { Subject, } from "rxjs";
import { MessageEventDto } from "./dto/quotes.dto";
import { WebSocket } from "ws";
import { QuotesTpConnector } from "./quotes.tp-connector";

@Injectable()
export class QuotesProxy {
  private readonly logger = new Logger(QuotesProxy.name);
  private readonly messagesStreamsByClients = new Map<WebSocket, Subject<MessageEventDto>>();

  constructor(
    private readonly tpConnector: QuotesTpConnector,
  ) {}

  public async getMessagesStream({
    client,
    symbols,
    moduleId,
  }: {
    client: WebSocket,
    symbols: string[],
    moduleId: number,
  }): Promise<Subject<MessageEventDto>> {
    const existingStream = this.messagesStreamsByClients.get(client);
    if (existingStream) {
      this.tpConnector.stopMessagesStream(existingStream);
    }

    const messagesStream = await this.tpConnector.getMessagesStream(symbols, moduleId);
    this.messagesStreamsByClients.set(client, messagesStream);

    client.on('close', () => {
      this.logger.log(`Stopping messages stream since client is closed`);
      this.tpConnector.stopMessagesStream(messagesStream);
      this.messagesStreamsByClients.delete(client);
    });

    return messagesStream;
  }

  public async updateMessagesStream({
    client,
    symbols,
    moduleId
  }: {
    client: WebSocket,
    symbols: string[],
    moduleId: number,
  }) {
    const messagesStream = this.messagesStreamsByClients.get(client);
    if (!messagesStream) {
      throw new Error('Messages stream is not found while trying to update it');
    }
    await this.tpConnector.updateMessagesStream({
      messagesStream,
      instruments: symbols,
      moduleId,
    });
  }
}
