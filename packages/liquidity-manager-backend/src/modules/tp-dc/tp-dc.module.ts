import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TpDcService } from "./tp-dc.service";
import { WebsocketsModule } from "@jifeon/boar-pack-common-backend/src/modules/websockets/websockets.module";
import { TpDcConfigService } from "./tp-dc.config";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    WebsocketsModule,
    ConfigModule,
  ],
  providers: [
    TpDcService,
    TpDcConfigService,
  ],
  exports: [
    TpDcService,
  ],
})
export class TpDcModule {}
