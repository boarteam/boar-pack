import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsException
} from "@nestjs/websockets";
import { WebSocket } from "ws";
import { Interval } from "@nestjs/schedule";
import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import { CheckPolicies, PoliciesGuard, WsAuthGuard, WsAuthService } from "@jifeon/boar-pack-users-backend";
import { IncomingMessage } from "http";
import { WebsocketsEventDto, WebsocketsExceptionFilter } from "@jifeon/boar-pack-common-backend";
import { ViewQuotesPolicy } from "./policies/view-quotes.policy";
import { MessagesStream, SubscribeEventDto } from "./dto/quotes.dto";
import { QuotesProxy } from "./quotes.proxy";

@WebSocketGateway({
  path: '/quotes',
})
@UseGuards(WsAuthGuard, PoliciesGuard)
@UseFilters(WebsocketsExceptionFilter)
export class QuotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QuotesGateway.name);
  private clients: Set<WebSocket> = new Set();
  private clientsToTerminate: Set<WebSocket> = new Set();

  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly proxy: QuotesProxy,
  ) {
  }

  public handleConnection(client: WebSocket, req: IncomingMessage) {
    this.wsAuthService.onClientConnect(client, req);
  }

  public handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
  }

  private addClient(client: WebSocket) {
    if (this.clients.has(client)) {
      return;
    }

    this.clients.add(client);
    client.on('pong', () => {
      this.clientsToTerminate.delete(client);
    });
  }

  @Interval(5000)
  private checkClients() {
    this.clients.forEach((client) => {
      if (this.clientsToTerminate.has(client)) {
        client.terminate();
        this.clients.delete(client);
      } else {
        this.clientsToTerminate.add(client);
        client.ping();
      }
    });
  }

  public broadcast(event: WebsocketsEventDto) {
    const eventStr = JSON.stringify(event);
    for (const client of this.clients) {
      client.send(eventStr, (err) => {
        if (err) {
          this.logger.error(`Error sending event to client: ${err.message}`);
        }
      });
    }
  }

  @SubscribeMessage('subscribe')
  @CheckPolicies(new ViewQuotesPolicy())
  private handleSubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() subscribeEventDto: SubscribeEventDto['data'],
  ): Promise<MessagesStream> {
    this.addClient(client);

    const { symbols } = subscribeEventDto;
    if (!Array.isArray(symbols) || !symbols.length || !symbols.every((symbol) => typeof symbol === 'string')) {
      // TODO: add validation pipe, also check there are corresponding instruments, number of symbols and length
      // of every symbol
      throw new WsException('Symbols should be a non-empty array of strings');
    }

    return this.proxy.getMessagesStream(client, symbols.filter((symbol) => symbol.length > 0));
  }
}
