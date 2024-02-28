import { Module } from '@nestjs/common';
import { WsAuthService } from "./ws-auth.service";
import { WsAuthGuard } from "./ws-auth.guard";

@Module({
  imports: [],
  providers: [
    WsAuthGuard,
    WsAuthService,
  ],
  exports: [
    WsAuthService,
  ],
})
export class WsAuthModule {}
