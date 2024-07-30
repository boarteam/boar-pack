import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { WebSocket } from "ws";
import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import { CheckPolicies, PoliciesGuard, WsAuthGuard } from "@jifeon/boar-pack-users-backend";
import { WebsocketsExceptionFilter } from "@jifeon/boar-pack-common-backend";
import { ViewQuotesPolicy } from "./policies/view-quotes.policy";
import { MessageEventDto, MessagesStream, SubscribeEventDto } from "./dto/quotes.dto";
import { Subject } from "rxjs";
import { QuotesTpConnector } from "./quotes.tp-connector";

@WebSocketGateway({
  path: '/ws',
})
@UseGuards(WsAuthGuard, PoliciesGuard)
@UseFilters(WebsocketsExceptionFilter)
export class QuotesGateway {
  private readonly messagesStreamsByClients = new Map<WebSocket, Subject<MessageEventDto>>();
  private readonly logger = new Logger(QuotesGateway.name);

  constructor(
    private readonly tpConnector: QuotesTpConnector,
  ) {}

  @SubscribeMessage('subscribe')
  @CheckPolicies(new ViewQuotesPolicy())
  private async handleSubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() subscribeEventDto: SubscribeEventDto['data'],
  ): Promise<MessagesStream | void> {
    let { symbols, moduleId } = subscribeEventDto;
    if (!Array.isArray(symbols) || !symbols.length || !symbols.every((symbol) => typeof symbol === 'string')) {
      // TODO: add validation pipe, also check there are corresponding instruments, number of symbols and length
      // of every symbol
      throw new WsException('Symbols should be a non-empty array of strings');
    }

    symbols = symbols.filter((symbol) => symbol.length > 0);

    const existingStream = this.messagesStreamsByClients.get(client);
    if (existingStream) {
      await this.tpConnector.updateMessagesStream({
        messagesStream: existingStream,
        instruments: symbols,
        moduleId,
      });
      return;
    }

    const messagesStream = await this.tpConnector.getMessagesStream(symbols, moduleId);
    this.messagesStreamsByClients.set(client, messagesStream);

    client.on('close', () => {
      this.logger.log(`Stopping messages stream since client is closed`);
      this.tpConnector.stopMessagesStream(messagesStream).catch((e) => {
        this.logger.error(`Error stopping messages stream`);
        this.logger.error(e, e.stack);
      });
      this.messagesStreamsByClients.delete(client);
    });

    return messagesStream;
  }
}
