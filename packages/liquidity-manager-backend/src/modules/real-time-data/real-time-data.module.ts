import { Module } from '@nestjs/common';
import { RealTimeDataGateway } from "./real-time-data.gateway";
import { HttpModule } from "@nestjs/axios";
import { CaslModule, WsAuthModule } from "@jifeon/boar-pack-users-backend";
import { AmtsDcModule } from "../amts-dc/amts-dc.module";
import { RealTimeDataService } from "./real-time-data.service";
import { UsersInstModule } from "../users-inst/users-inst.module";

@Module({})
export class RealTimeDataModule {
  static forWorker() {
    return {
      module: RealTimeDataModule,
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
        WsAuthModule,
        AmtsDcModule,
        CaslModule.forFeature(),
        UsersInstModule.forFeature(),
      ],
      providers: [
        RealTimeDataGateway,
        RealTimeDataService,
      ],
    };
  }
}
