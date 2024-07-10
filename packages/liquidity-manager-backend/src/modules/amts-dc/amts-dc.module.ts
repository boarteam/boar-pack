import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AmtsDcService } from "./amts-dc.service";
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
    AmtsDcService,
  ],
  exports: [
    AmtsDcService,
  ],
})
export class AmtsDcModule {}
