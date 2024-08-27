import { Module } from '@nestjs/common';
import { QuotesGateway } from "./quotes.gateway";
import { HttpModule } from "@nestjs/axios";
import { CaslModule, WsAuthModule } from "@jifeon/boar-pack-users-backend";
import { TpDcModule } from "../tp-dc/tp-dc.module";
import { QuotesTpConnector } from "./quotes.tp-connector";
import { UsersInstModule } from "../users-inst/users-inst.module";

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
        UsersInstModule.forFeature(),
      ],
      providers: [
        QuotesGateway,
        QuotesTpConnector,
      ],
    };
  }
}
