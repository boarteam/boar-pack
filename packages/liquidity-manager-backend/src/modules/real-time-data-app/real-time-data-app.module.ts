import { DynamicModule, Logger, Module, Optional } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JoiPipeModule } from "nestjs-joi";
import { CaslModule, JwtAuthModule } from "@jifeon/boar-pack-users-backend";
import { CaslPermissionsModule } from "../casl-permissions";
import { RealTimeDataModule } from "../real-time-data/real-time-data.module";
import { LiquidityManagersModule } from "../liquidity-managers";
import { ClusterModule, ClusterService } from "@jifeon/boar-pack-common-backend";
import { AMTS_DB_NAME, RealTimeDataAppConfig } from "./real-time-data-app.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtAuthModule as LMJwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { RealTimeDataAppCluster } from "./real-time-data-app.cluster";

@Module({})
export class RealTimeDataAppModule {
  private readonly logger = new Logger('RealTimeDataAppModule');

  static forRoot(
    config: {
      dataSourceName: string;
    }
  ): DynamicModule {
    return {
      module: RealTimeDataAppModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          name: AMTS_DB_NAME,
          imports: [
            ConfigModule,
            ClusterModule,
            LiquidityManagersModule.forConfig({ dataSourceName: config.dataSourceName }),
          ],
          useClass: RealTimeDataAppConfig,
        }),
        JwtAuthModule.register({
          dataSourceName: config.dataSourceName,
        }),
        CaslModule.forRoot(),
        CaslPermissionsModule,
        JoiPipeModule,
        RealTimeDataModule.forWorker(),
      ],
      providers: [],
      exports: [],
    }
  }

  static forManagerPanel(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: RealTimeDataAppModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          name: AMTS_DB_NAME,
          imports: [
            ConfigModule,
            ClusterModule,
            LiquidityManagersModule.forConfig({ dataSourceName: config.dataSourceName }),
          ],
          useClass: RealTimeDataAppConfig,
        }),
        LMJwtAuthModule.forRoot(),
        CaslModule.forRoot(),
        CaslPermissionsModule,
        JoiPipeModule,
        RealTimeDataModule.forWorker(),
      ],
      providers: [],
      exports: [],
    }
  }

  static forClusterMaster() {
    return {
      module: RealTimeDataAppModule,
      imports: [
        ClusterModule,
      ],
      providers: [
        RealTimeDataAppCluster,
      ],
      exports: [],
      controllers: []
    }
  }

  constructor(
    @Optional() private readonly cluster: ClusterService,
    @Optional() private readonly realTimeDataCluster: RealTimeDataAppCluster,
  ) {
    if (this.cluster && this.realTimeDataCluster) {
      this.cluster.addCluster(this.realTimeDataCluster);
    } else {
      this.logger.log('ClusterService or RealTimeDataAppCluster is not provided, RealTimeDataAppCluster will not be added to the cluster');
    }
  }
}
