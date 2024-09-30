import { DynamicModule, Inject, Logger, Module, Optional } from '@nestjs/common';
import { LiquidityManagersService } from './liquidity-managers.service';
import { LiquidityManagersController } from './liquidity-managers.controller';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityManager, WORKER_UNIQUE_CONSTRAINT } from './entities/liquidity-manager.entity';
import { LiquidityManagersCluster } from "./liquidity-managers.cluster";
import { ClusterModule, ClusterService, ScryptModule, ScryptService, Tools } from "@jifeon/boar-pack-common-backend";
import { Action, CaslAbilityFactory, EventLogsModule } from "@jifeon/boar-pack-users-backend";
import {
  LiquidityManagersUserRoles,
  LiquidityManagersUsersModule,
  LiquidityManagersUsersService
} from "../liquidity-managers-users";

export const MANAGER_PANEL = Symbol('MANAGER_PANEL');

@Module({})
export class LiquidityManagersModule {
  private logger = new Logger('LiquidityManagersModule');

  static register(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManager], config.dataSourceName),
        ScryptModule,
        ClusterModule,
        EventLogsModule.forFeature({
          dataSourceName: config.dataSourceName,
        }),
        LiquidityManagersUsersModule.forFeature({
          dataSourceName: config.dataSourceName,
        })
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

  static forAdminPanel(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManager], config.dataSourceName),
        ScryptModule,
        ClusterModule,
        EventLogsModule.forFeature({
          dataSourceName: config.dataSourceName,
        }),
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

  static forManagerPanel(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManager], config.dataSourceName),
        ScryptModule,
      ],
      providers: [
        {
          provide: LiquidityManagersService,
          inject: [getDataSourceToken(config.dataSourceName), ScryptService],
          useFactory: (dataSource, scryptService) => {
            return new LiquidityManagersService(dataSource.getRepository(LiquidityManager), scryptService);
          }
        },
        {
          provide: MANAGER_PANEL,
          useValue: true,
        },
      ],
      exports: [
        LiquidityManagersService,
      ],
      controllers: [LiquidityManagersController],
    };
  }

  static forConfig(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManager], config.dataSourceName),
        ScryptModule,
      ],
      providers: [
        {
          provide: LiquidityManagersService,
          inject: [getDataSourceToken(config.dataSourceName), ScryptService],
          useFactory: (dataSource, scryptService) => {
            return new LiquidityManagersService(dataSource.getRepository(LiquidityManager), scryptService);
          }
        },
      ],
      exports: [
        LiquidityManagersService,
      ],
      controllers: [],
    };
  }

  constructor(
    @Optional() private readonly cluster: ClusterService,
    @Optional() private readonly liquidityManagersCluster: LiquidityManagersCluster,
    @Optional() private readonly liquidityManagersUsers: LiquidityManagersUsersService,
    @Optional() @Inject(MANAGER_PANEL) private readonly managerPanel: boolean,
  ) {
    Tools.TypeOrmExceptionFilter.setUniqueConstraintMessage(WORKER_UNIQUE_CONSTRAINT, 'Choose another worker for this liquidity manager');
    if (this.cluster && this.liquidityManagersCluster) {
      this.cluster.addCluster(this.liquidityManagersCluster);
    } else {
      this.logger.log('ClusterService or LiquidityManagersCluster is not provided, clustering is disabled');
    }

    if (this.liquidityManagersUsers) {
      CaslAbilityFactory.addAbilitiesDefiner(async (user, can, cannot) => {
        const lmUsers = await this.liquidityManagersUsers.find({
          select: ['id', 'role', 'liquidityManagerId'],
          where: {
            userId: user.id,
          },
          join: {
            alias: 'lmUser',
          }
        });

        lmUsers.forEach(lmUser => {
          const action = lmUser.role === LiquidityManagersUserRoles.MANAGER ? Action.Manage : Action.Read;
          can(action, LiquidityManager, { id: lmUser.liquidityManagerId });
        });
      });
    }

    if (this.managerPanel) {
      CaslAbilityFactory.addAbilitiesDefiner(async (user, can, cannot) => {
        can(Action.Read, LiquidityManager);
      });
    }
  }
}
