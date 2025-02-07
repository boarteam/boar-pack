import { Module } from '@nestjs/common';
import { WsAuthGateway } from "./ws-auth.gateway";
import { WsAuthGuard } from "./ws-auth.guard";
import { WsAuthService } from "./ws-auth.service";
import { WS_AUTH_STRATEGY } from "./ws-auth.constants";
import { JWT_AUTH } from "../auth";

@Module({
  imports: [],
  providers: [
    WsAuthGateway,
    WsAuthGuard,
    WsAuthService,
    {
      provide: WS_AUTH_STRATEGY,
      useValue: JWT_AUTH,
    }
  ],
  exports: [
    WsAuthService,
    WsAuthGuard,
  ],
})
export class WsAuthModule {
  static forCustomStrategy(strategy: string) {
    return {
      module: WsAuthModule,
      providers: [
        {
          provide: WS_AUTH_STRATEGY,
          useValue: strategy,
        }
      ]
    };
  }
}
