import {CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import { WebSocket } from "ws";
import { WsAuthService } from "./ws-auth.service";
import {
  WsErrorCodes
} from "@jifeon/boar-pack-common-backend/src/modules/websockets/websockets.clients";

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(
    private readonly wsAuthService: WsAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<WebSocket>();
    const user = await this.wsAuthService.finishInitialization(client);

    if (!user) {
      this.logger.warn(`Unauthorized connection by websocket`);
      client.close(WsErrorCodes.Unauthorized, 'You have been logged out, please login again');
      return false;
    }

    return !!user;
  }
}
