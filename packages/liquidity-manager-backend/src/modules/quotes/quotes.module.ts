import { Logger, Module, Optional } from '@nestjs/common';
import { ClusterModule, ClusterService } from "@jifeon/boar-pack-common-backend";
import { QuotesCluster } from "./quotes.cluster";
import { QuotesGateway } from "./quotes.gateway";
import { HttpModule } from "@nestjs/axios";
import { CaslModule, WsAuthModule } from "@jifeon/boar-pack-users-backend";
import { QuotesProxy } from "./quotes.proxy";
import { AmtsDcModule } from "../amts-dc/amts-dc.module";
import { QuotesAmtsConnector } from "./quotes.amts-connector";

@Module({})
export class QuotesModule {
  private readonly logger = new Logger('QuotesModule');

  static forMaster() {
    return {
      module: QuotesModule,
      imports: [
        ClusterModule,
      ],
      providers: [
        QuotesCluster,
      ],
      exports: [],
      controllers: []
    }
  }

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
        QuotesProxy,
        QuotesAmtsConnector,
      ],
    };
  }

  constructor(
    @Optional() private readonly cluster: ClusterService,
    @Optional() private readonly quotesCluster: QuotesCluster,
  ) {
    if (this.cluster && this.quotesCluster) {
      this.cluster.addCluster(this.quotesCluster);
    } else {
      this.logger.log('ClusterService or QuotesCluster is not provided, QuotesCluster will not be added to the cluster');
    }
  }
}
