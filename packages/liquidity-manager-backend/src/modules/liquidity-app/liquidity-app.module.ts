import { DynamicModule, Module } from "@nestjs/common";
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
import { LiquidityManagersModule } from "../liquidity-managers";
import { AuthModule, CaslModule } from "@jifeon/boar-pack-users-backend";
import { ClusterModule } from "@jifeon/boar-pack-common-backend";
import { CaslPermissionsModule } from "../casl-permissions";
import { AuthModule as LMAuthModule } from "../auth";

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
  static forRoot(config: {
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
            LiquidityManagersModule.register({ dataSourceName: config.dataSourceName }),
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
        LiquidityManagersModule.register({
          dataSourceName: config.dataSourceName,
        }),
        ...restModules,
      ],
      providers: [],
      exports: [],
    }
  }
}
