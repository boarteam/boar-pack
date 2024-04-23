import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsModule } from "../settings/settings.module";
import { TID_DB_NAME, TidTypeormConfig } from "../app/tid-typeorm.config";
import { AMTS_DB_NAME, LiquidityAppConfig } from "./liquidity-app.config";
import { EcnModulesModule } from "./ecn-modules/ecn-modules.module";
import { EcnInstrumentsModule } from "./ecn-instruments/ecn-instruments.module";
import { EcnInstrumentsGroupsModule } from "./ecn-instruments-groups/ecn-instruments-groups.module";
import { UsersInstModule } from "./users-inst/users-inst.module";
import { EcnModuleTypesModule } from "./ecn-module-types/ecn-module-types.module";
import { AmtsDbModule } from "../amts-db/amts-db.module";
import { UsersGroupsInstModule } from "./users-groups-inst/users-groups-inst.module";
import { EcnConnectSchemaModule } from "./ecn-connect-schema/ecn-connect-schema.module";
import { EcnSubscrSchemaModule } from "./ecn-subscr-schema/ecn-subscr-schema.module";
import {
  EcnConnectSchemaSetupLabelsModule
} from "./ecn-connect-schema-setup-labels/ecn-connect-schema-setup-labels.module";
import { UsersSubAccountsInstModule } from "./users-sub-accounts-inst/users-sub-accounts-inst.module";
import { SubloginsSettingsModule } from "./sublogin-settings/sublogins-settings.module";
import { LiquidityManagersModule } from "../liquidity-managers/liquidity-managers.module";
import { ClusterModule } from "../common/cluster/cluster.module";
import { AuthModule } from "../auth/auth.module";
import { JoiPipeModule } from "nestjs-joi";

@Module({
  imports: [
    ConfigModule,
    SettingsModule.register({ withControllers: false }),
    TypeOrmModule.forRootAsync({
      name: TID_DB_NAME,
      imports: [ConfigModule],
      useClass: TidTypeormConfig,
    }),
    TypeOrmModule.forRootAsync({
      name: AMTS_DB_NAME,
      imports: [
        ConfigModule,
        AmtsDbModule.register(),
        ClusterModule,
        LiquidityManagersModule.register({ withControllers: false }),
      ],
      useClass: LiquidityAppConfig,
    }),
    AuthModule,
    JoiPipeModule,
    EcnModulesModule.register(),
    EcnModuleTypesModule.register(),
    UsersGroupsInstModule.register(),
    UsersInstModule.register(),
    UsersSubAccountsInstModule.register(),
    SubloginsSettingsModule.register(),
    EcnInstrumentsGroupsModule.register(),
    EcnInstrumentsModule.register(),
    EcnConnectSchemaModule.register(),
    EcnConnectSchemaSetupLabelsModule.register(),
    EcnSubscrSchemaModule.register(),
  ],
  providers: [],
  exports: [],
})
export class LiquidityAppModule {}
