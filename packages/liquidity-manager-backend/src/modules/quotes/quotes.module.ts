import { Module } from '@nestjs/common';
import { QuotesGateway } from "./quotes.gateway";
import { HttpModule } from "@nestjs/axios";
import { CaslModule, WsAuthModule } from "@jifeon/boar-pack-users-backend";
import { AmtsDcModule } from "../amts-dc/amts-dc.module";
import { QuotesAmtsConnector } from "./quotes.amts-connector";

@Module({})
export class QuotesModule {
  static forWorker() {
    return {
      module: QuotesModule,
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
        WsAuthModule,
        AmtsDcModule,
        CaslModule.forFeature(),
      ],
      providers: [
        QuotesGateway,
        QuotesAmtsConnector,
      ],
    };
  }
}
