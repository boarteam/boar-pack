import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LiquidityManagersService } from "../liquidity-managers/liquidity-managers.service";
import { ClusterConfigService, TClusterConfig } from "@jifeon/boar-pack-common-backend";
import { entities } from "../liquidity-app/liquidity-app.constants";

export const AMTS_DB_NAME = 'amts_db';

@Injectable()
export class RealTimeDataAppConfig implements TypeOrmOptionsFactory {
  private readonly config: TClusterConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly clusterConfigService: ClusterConfigService,
    private readonly liquidityManagersService: LiquidityManagersService,
  ) {
    this.config = this.clusterConfigService.config;
  }

  async createTypeOrmOptions(name: string): Promise<TypeOrmModuleOptions> {
    const dbSettings = await this.liquidityManagersService.getDbConnectionForWorker();

    return {
      name: AMTS_DB_NAME,
      type: 'mysql',
      synchronize: false,
      logging: 'all',
      entities,
      namingStrategy: new SnakeNamingStrategy(),
      ...dbSettings,
    };
  }
}