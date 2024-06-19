import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AmtsDcService } from "./amts-dc.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    AmtsDcService,
  ],
  exports: [
    AmtsDcService,
  ],
})
export class AmtsDcModule {}
