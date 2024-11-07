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
import {
  LiquidityManagersUserRoles,
  LiquidityManagersUsersModule,
  LiquidityManagersUsersService
} from "../liquidity-managers-users";
import { PositionsModule } from "../positions/positions.module";
import { MyInstrumentsModule } from "../my-instruments/my-instruments.module";
import { UserInfoModule } from "../user-info/user-info.module";
import { MySubloginSettingsModule } from "../my-sublogin-settings/my-sublogin-settings.module";
import { MyUsersSubAccountsInstModule } from "../my-users-sub-accounts-inst/my-users-sub-accounts-inst.module";
import { ViewInstrumentsSpecificationsModule } from "../view-instruments-specifications/view-instruments-specifications.module";
import { ReportAccountStatementsModule } from "../report-account-statements/report-account-statements.module";
import { ReportBalanceOperationsModule } from "../report-balance-operations/report-balance-operations.module";
import { ReportTradesModule } from "../report-trades/report-trades.module";

export const restModules = [
  EcnModulesModule,
  EcnModuleTypesModule,
  UsersGroupsInstModule,
  UsersInstModule.forRoot(),
  UsersSubAccountsInstModule,
  SubloginsSettingsModule,
  EcnInstrumentsGroupsModule,
  EcnInstrumentsModule,
  ViewInstrumentsSpecificationsModule,
  EcnConnectSchemaModule,
  EcnConnectSchemaSetupLabelsModule,
  EcnSubscrSchemaModule,
  PositionsModule.forRestApi(),
  UserInfoModule.forRestApi(),
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
        MyInstrumentsModule,
        MySubloginSettingsModule,
        MyUsersSubAccountsInstModule,
        ReportAccountStatementsModule,
        ReportBalanceOperationsModule,
        ReportTradesModule,
        // RealTimeDataAppModule.forClusterMaster(),
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
