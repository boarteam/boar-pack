import { Module } from '@nestjs/common';
import { QuotesGateway } from "./quotes.gateway";
import { HttpModule } from "@nestjs/axios";
import { CaslModule, WsAuthModule } from "@jifeon/boar-pack-users-backend";
import { TpDcModule } from "../tp-dc/tp-dc.module";
import { QuotesTpConnector } from "./quotes.tp-connector";

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
        TpDcModule,
        CaslModule.forFeature(),
      ],
      providers: [
        QuotesGateway,
        QuotesTpConnector,
      ],
    };
  }
}
