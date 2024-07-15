import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TpDcService } from "./tp-dc.service";
import { WebsocketsModule } from "@jifeon/boar-pack-common-backend/src/modules/websockets/websockets.module";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    WebsocketsModule,
  ],
  providers: [
    TpDcService,
  ],
  exports: [
    TpDcService,
  ],
})
export class TpDcModule {}
