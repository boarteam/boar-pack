import { resolve } from "path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TpDbService } from "../tp-db/tp-db.service";
import { LiquidityManagersService } from "../liquidity-managers/liquidity-managers.service";
import { ClusterConfigService, TClusterConfig } from "../common/cluster/cluster.config";
import { LiquidityManagerWorkers } from "../liquidity-managers/entities/liquidity-manager.entity";

export const TP_DB_NAME = 'tp_db';

@Injectable()
export class LiquidityAppConfig implements TypeOrmOptionsFactory {
  private readonly config: TClusterConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly tpDbService: TpDbService,
    private readonly clusterConfigService: ClusterConfigService,
    private readonly liquidityManagersService: LiquidityManagersService,
  ) {
    this.config = this.clusterConfigService.config;
  }

  async createTypeOrmOptions(name: string): Promise<TypeOrmModuleOptions> {
    const dbSettings = await this.liquidityManagersService.getDbConnectionForWorker(this.config.worker as LiquidityManagerWorkers);

    return {
      name: TP_DB_NAME,
      type: 'mysql',
      synchronize: this.configService.get<string>('SYNC_DB') === 'true',
      logging: 'all',
      entities: [resolve(__dirname, './**/entities/*.entity.{ts,js}')],
      namingStrategy: new SnakeNamingStrategy(),
      ...dbSettings,
    };
  }
}
