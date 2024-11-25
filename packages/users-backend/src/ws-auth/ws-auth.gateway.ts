import { Logger } from '@nestjs/common';
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from "@nestjs/websockets";
import { AuthSocket, WsAuthService } from "./ws-auth.service";

@WebSocketGateway({
  path: '/ws',
})
export class WsAuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(WsAuthGateway.name);

  constructor(
    private readonly wsAuthService: WsAuthService,
  ) {}

  public handleConnection(socket: AuthSocket, req: IncomingMessage) {
    this.logger.debug(`Client connected`);
    this.wsAuthService.handleConnection(socket, req);
  }

  public handleDisconnect(client: WebSocket) {
    this.wsAuthService.handleDisconnect(client);
  }
}
