import { Module } from '@nestjs/common';
import { WsAuthGateway } from "./ws-auth.gateway";
import { WsAuthGuard } from "./ws-auth.guard";
import { WsAuthService } from "./ws-auth.service";

@Module({
  imports: [],
  providers: [
    WsAuthGateway,
    WsAuthGuard,
    WsAuthService,
  ],
  exports: [
    WsAuthService,
    WsAuthGuard,
  ],
})
export class WsAuthModule {}
