import { Module } from '@nestjs/common';
import { Action, CaslAbilityFactory } from '@jifeon/boar-pack-users-backend';
import { LiquidityManager } from "../liquidity-managers";
import { EcnModule } from "../ecn-modules/entities/ecn-module.entity";
import { EcnModuleType } from "../ecn-module-types/entities/ecn-module-type.entity";
import { EcnConnectSchema } from "../ecn-connect-schema/entities/ecn-connect-schema.entity";
import {
  EcnConnectSchemaSetupLabel
} from "../ecn-connect-schema-setup-labels/entities/ecn-connect-schema-setup-label.entity";
import { EcnSubscrSchema } from "../ecn-subscr-schema/entities/ecn-subscr-schema.entity";
import { EcnInstrument } from "../ecn-instruments/entities/ecn-instrument.entity";
import { EcnInstrumentsGroup } from "../ecn-instruments-groups/entities/ecn-instruments-group.entity";
import { UsersGroupsInst } from "../users-groups-inst/entities/users-groups-inst.entity";
import { UsersInst } from "../users-inst/entities/users-inst.entity";
import { UsersSubAccountInst } from "../users-sub-accounts-inst/entities/users-sub-account-inst.entity";

export enum Permissions {
  VIEW_LIQUIDITY = 'view_liquidity',
  MANAGE_LIQUIDITY = 'manage_liquidity',
}

@Module({})
export class CaslPermissionsModule {
  constructor() {
    const Liquidity = 'Liquidity' as const;
    const Quotes = 'Quotes' as const;

    const permissions = [
      {
        permission: Permissions.VIEW_LIQUIDITY,
        action: Action.Read,
        subject: [
          LiquidityManager,
          EcnModule,
          EcnModuleType,
          EcnConnectSchema,
          EcnConnectSchemaSetupLabel,
          EcnSubscrSchema,
          EcnInstrument,
          EcnInstrumentsGroup,
          UsersGroupsInst,
          UsersInst,
          UsersSubAccountInst,
          Liquidity,
          Quotes,
        ],
      },
      {
        permission: Permissions.MANAGE_LIQUIDITY,
        action: Action.Manage,
        subject: [
          LiquidityManager,
          EcnModule,
          EcnModuleType,
          EcnConnectSchema,
          EcnConnectSchemaSetupLabel,
          EcnSubscrSchema,
          EcnInstrument,
          EcnInstrumentsGroup,
          UsersGroupsInst,
          UsersInst,
          UsersSubAccountInst,
          Liquidity,
          Quotes,
        ],
      },
    ];

    permissions.forEach(CaslAbilityFactory.addPermissionToAction);
  }
}
