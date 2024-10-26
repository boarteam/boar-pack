import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { WebSocket } from "ws";
import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import { CheckPolicies, PoliciesGuard, WsAuthGuard } from "@jifeon/boar-pack-users-backend";
import { WebsocketsExceptionFilter } from "@jifeon/boar-pack-common-backend";
import { ViewRealTimeDataPolicy } from "./policies/view-real-time-data.policy";
import {
  MessageEventDto,
  MessagesStream,
  SubscribeToQuotesEventDto,
  SubscribeToPositionsEventDto,
  SubscribeToUserInfoEventDto
} from "./dto/real-time-data.dto";
import { Subject } from "rxjs";
import { RealTimeDataService } from "./real-time-data.service";
import { UsersInstService } from "../users-inst/users-inst.service";
import { TConnectorConfig } from "./real-time-data.types";

@WebSocketGateway({
  path: '/ws',
})
@UseGuards(WsAuthGuard, PoliciesGuard)
@UseFilters(WebsocketsExceptionFilter)
export class RealTimeDataGateway {
  private readonly messagesStreamsByClients = new Map<WebSocket, Subject<MessageEventDto>>();
  private readonly logger = new Logger(RealTimeDataGateway.name);

  constructor(
    private readonly service: RealTimeDataService,
    private readonly usersInstService: UsersInstService,
  ) {
  }

  private async createMessageStream(config: TConnectorConfig, client: WebSocket): Promise<MessagesStream> {
    const messagesStream = await this.service.createMessagesStream(config);
    this.messagesStreamsByClients.set(client, messagesStream);

    client.on('close', () => {
      this.logger.log(`Stopping messages stream since client is closed`);
      this.service.stopMessagesStream(messagesStream).catch((e) => {
        this.logger.error(`Error stopping messages stream`);
        this.logger.error(e, e.stack);
      });
      this.messagesStreamsByClients.delete(client);
    });

    return messagesStream;
  }

  @SubscribeMessage('subscribeToQuotes')
  @CheckPolicies(new ViewRealTimeDataPolicy())
  private async handleSubscribeToQuotes(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() subscribeEventDto: SubscribeToQuotesEventDto['data'],
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
      await this.service.subscribeToQuotes({
        messagesStream: existingStream,
        symbols,
        moduleId,
      });
    } else {
      const config = this.service.createConnectionConfig(moduleId);
      config.quotesSubscription = {
        symbols,
      }
      return this.createMessageStream(config, client);
    }
  }

  @SubscribeMessage('subscribeToSnapshots')
  @CheckPolicies(new ViewRealTimeDataPolicy())
  private async handleSubscribeToSnapshots(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() subscribeEventDto: SubscribeToQuotesEventDto['data'],
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
      await this.service.subscribeToSnapshots({
        messagesStream: existingStream,
        symbols,
        moduleId,
      });
    } else {
      const config = this.service.createConnectionConfig(moduleId);
      config.snapshotsSubscription = {
        symbols,
      }
      return this.createMessageStream(config, client);
    }
  }

  @SubscribeMessage('subscribeToUserInfo')
  @CheckPolicies(new ViewRealTimeDataPolicy())
  private async handleSubscribeToUserInfo(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() subscribeEventDto: SubscribeToUserInfoEventDto['data'],
  ): Promise<MessagesStream | void> {
    const existingStream = this.messagesStreamsByClients.get(client);
    const marginModuleId = await this.usersInstService.getMarginModuleId(subscribeEventDto.userId);
    if (existingStream) {
      await this.service.subscribeToUserInfo({
        messagesStream: existingStream,
        userId: subscribeEventDto.userId,
        moduleId: marginModuleId,
      });
    } else {
      const config = this.service.createConnectionConfig(marginModuleId);
      config.userInfoSubscription = {
        userId: subscribeEventDto.userId,
      }
      return this.createMessageStream(config, client);
    }
  }

  @SubscribeMessage('subscribeToPositions')
  @CheckPolicies(new ViewRealTimeDataPolicy())
  private async handleSubscribeToPositions(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() subscribeToPositionsEventDto: SubscribeToPositionsEventDto['data'],
  ): Promise<MessagesStream | void> {
    const existingStream = this.messagesStreamsByClients.get(client);
    const marginModuleId = await this.usersInstService.getMarginModuleId(subscribeToPositionsEventDto.userId);

    if (existingStream) {
      await this.service.subscribeToPositions({
        messagesStream: existingStream,
        userId: subscribeToPositionsEventDto.userId,
        moduleId: marginModuleId,
      });
    } else {
      const config = this.service.createConnectionConfig(marginModuleId);
      config.positionsSubscription = {
        userId: subscribeToPositionsEventDto.userId,
      }
      return await this.createMessageStream(config, client);
    }
  }
}
