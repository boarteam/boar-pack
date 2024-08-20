import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AmtsDcService } from "./amts-dc.service";
import { WebsocketsModule } from "@jifeon/boar-pack-common-backend/src/modules/websockets/websockets.module";
import { AmtsDcConfigService } from "./amts-dc.config";
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
    AmtsDcService,
    AmtsDcConfigService,
  ],
  exports: [
    AmtsDcService,
  ],
})
export class AmtsDcModule {}
