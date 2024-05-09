import { DynamicModule, Module } from '@nestjs/common';
import { LiquidityManagersService } from './liquidity-managers.service';
import { LiquidityManagersController } from './liquidity-managers.controller';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityManager, WORKER_UNIQUE_CONSTRAINT } from './entities/liquidity-manager.entity';
import { LiquidityManagersCluster } from "./liquidity-managers.cluster";
import { ClusterModule, ClusterService, ScryptModule, ScryptService, Tools } from "@jifeon/boar-pack-common-backend";

@Module({})
export class LiquidityManagersModule {
  static register(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManager], config.dataSourceName),
        ScryptModule,
        ClusterModule,
      ],
      providers: [
        {
          provide: LiquidityManagersService,
          inject: [getDataSourceToken(config.dataSourceName), ScryptService],
          useFactory: (dataSource, scryptService) => {
            return new LiquidityManagersService(dataSource.getRepository(LiquidityManager), scryptService);
          }
        },
        LiquidityManagersCluster,
      ],
      exports: [
        LiquidityManagersService,
      ],
      controllers: [LiquidityManagersController],
    };
  }

  constructor(
    private readonly cluster: ClusterService,
    private readonly liquidityManagersCluster: LiquidityManagersCluster,
  ) {
    Tools.TypeOrmExceptionFilter.setUniqueConstraintMessage(WORKER_UNIQUE_CONSTRAINT, 'Choose another worker for this liquidity manager');
    this.cluster.addCluster(this.liquidityManagersCluster);
  }
}
