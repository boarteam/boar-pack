import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsAuthGateway } from './ws-auth.gateway';
import { WebSocket } from "ws";

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly wsAuthService: WsAuthGateway) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<WebSocket>();
    const user = await this.wsAuthService.finishInitialization(client);

    if (!user) {
      this.logger.warn(`Unauthorized connection by websocket`);
    }

    return !!user;
  }
}
