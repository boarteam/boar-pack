import { DynamicModule, Module, Optional } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AMTS_DB_NAME, LiquidityAppConfig } from "./liquidity-app.config";
import { EcnModulesModule } from "../ecn-modules/ecn-modules.module";
import { EcnInstrumentsModule } from "../ecn-instruments/ecn-instruments.module";
import { EcnInstrumentsGroupsModule } from "../ecn-instruments-groups/ecn-instruments-groups.module";
import { UsersInstModule } from "../users-inst/users-inst.module";
import { EcnModuleTypesModule } from "../ecn-module-types/ecn-module-types.module";
import { UsersGroupsInstModule } from "../users-groups-inst/users-groups-inst.module";
import { EcnConnectSchemaModule } from "../ecn-connect-schema/ecn-connect-schema.module";
import { EcnSubscrSchemaModule } from "../ecn-subscr-schema/ecn-subscr-schema.module";
import {
  EcnConnectSchemaSetupLabelsModule
} from "../ecn-connect-schema-setup-labels/ecn-connect-schema-setup-labels.module";
import { UsersSubAccountsInstModule } from "../users-sub-accounts-inst/users-sub-accounts-inst.module";
import { SubloginsSettingsModule } from "../sublogin-settings/sublogins-settings.module";
import { JoiPipeModule } from "nestjs-joi";
import { LiquidityManagersModule, LiquidityManagerWorkers } from "../liquidity-managers";
import { Action, AuthModule, CaslAbilityFactory, CaslModule } from "@jifeon/boar-pack-users-backend";
import { ClusterConfigService, ClusterModule, TClusterConfig } from "@jifeon/boar-pack-common-backend";
import { CaslPermissionsModule, subjects } from "../casl-permissions";
import { AuthModule as LMAuthModule } from "../auth";
import { RealTimeDataAppModule } from "../real-time-data-app/real-time-data-app.module";
import {
  LiquidityManagersUserRoles,
  LiquidityManagersUsersModule,
  LiquidityManagersUsersService
} from "../liquidity-managers-users";
import { PositionsModule } from "../positions/positions.module";

export const restModules = [
  EcnModulesModule,
  EcnModuleTypesModule,
  UsersGroupsInstModule,
  UsersInstModule.forRoot(),
  UsersSubAccountsInstModule,
  SubloginsSettingsModule,
  EcnInstrumentsGroupsModule,
  EcnInstrumentsModule,
  EcnConnectSchemaModule,
  EcnConnectSchemaSetupLabelsModule,
  EcnSubscrSchemaModule,
] as const;

@Module({})
export class LiquidityAppModule {
  private readonly config: TClusterConfig;

  static forRoot(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityAppModule,
      imports: [
        ConfigModule,
        ClusterModule,
        TypeOrmModule.forRootAsync({
          name: AMTS_DB_NAME,
          imports: [
            ConfigModule,
            ClusterModule,
            LiquidityManagersModule.forConfig({ dataSourceName: config.dataSourceName }),
          ],
          useClass: LiquidityAppConfig,
        }),
        AuthModule.forRoot({
          googleAuth: false,
          msAuth: false,
          localAuth: false,
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
        CaslModule.forRoot(),
        CaslPermissionsModule,
        JoiPipeModule,
        LiquidityManagersUsersModule.forFeature({
          dataSourceName: config.dataSourceName,
        }),
        PositionsModule,
        ...restModules,
      ],
      providers: [],
      exports: [],
    }
  }

  static forManagerPanel(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityAppModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          name: AMTS_DB_NAME,
          imports: [
            ConfigModule,
            ClusterModule,
            LiquidityManagersModule.forConfig({ dataSourceName: config.dataSourceName }),
          ],
          useClass: LiquidityAppConfig,
        }),
        LMAuthModule,
        CaslModule.forRoot(),
        CaslPermissionsModule,
        JoiPipeModule,
        LiquidityManagersModule.forManagerPanel({
          dataSourceName: config.dataSourceName,
        }),
        RealTimeDataAppModule.forClusterMaster(),
        ...restModules,
      ],
      providers: [],
      exports: [],
    }
  }

  constructor(
    @Optional() private readonly clusterConfigService: ClusterConfigService,
    @Optional() private readonly liquidityManagersUsers: LiquidityManagersUsersService,
  ) {
    if (!this.clusterConfigService || !this.liquidityManagersUsers) {
      return;
    }

    this.config = this.clusterConfigService.config;

    CaslAbilityFactory.addAbilitiesDefiner(async (user, can, cannot) => {
      const lmUser = await this.liquidityManagersUsers.findOne({
        select: ['id', 'role'],
        where: {
          userId: user.id,
          liquidityManager: {
            worker: this.config.worker as LiquidityManagerWorkers,
          }
        },
        join: {
          alias: 'lmUser',
          innerJoin: {
            liquidityManager: 'lmUser.liquidityManager',
          }
        }
      });

      if (!lmUser) {
        return;
      }

      const action = lmUser.role === LiquidityManagersUserRoles.MANAGER ? Action.Manage : Action.Read;
      can(action, subjects);
    });
  }
}
