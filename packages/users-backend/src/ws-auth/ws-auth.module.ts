import { Module } from '@nestjs/common';
import { WsAuthGateway } from "./ws-auth.gateway";
import { WsAuthGuard } from "./ws-auth.guard";

@Module({
  imports: [],
  providers: [
    WsAuthGuard,
    WsAuthGateway,
  ],
  exports: [],
})
export class WsAuthModule {}
