import { Module } from '@nestjs/common';
import { Action, CaslAbilityFactory } from '@jifeon/boar-pack-users-backend';
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
import { SubloginSettings } from "../sublogin-settings/entities/sublogin-settings.entity";
import { MyInstrumentsPermissions } from "../my-instruments/my-instruments.permissions";
import { MyInstrument } from "../my-instruments/policies/view-my-instruments.policy";
import { MyAuditLog, MyAuditLogsPermissions } from "../my-audit-logs";
import { RealTimeData } from "../real-time-data/policies/view-real-time-data.policy";
import { Position } from "../positions/policies/view-positions.policy";
import { UserInfo } from "../user-info/policies/view-user-info.policy";
import { MySubloginSettingsPermissions } from '../my-sublogin-settings/my-sublogin-settings.permissions';
import { MySubloginSettings } from '../my-sublogin-settings/policies/view-my-sublogin-settings.policy';
import { MyUsersSubAccountsInstPermissions } from '../my-users-sub-accounts-inst/my-users-sub-accounts-inst.permissions';
import { MyUsersSubAccountsInst } from '../my-users-sub-accounts-inst/policies/view-my-users-sub-accounts-inst.policy';
import { ViewInstrumentsSpecification } from '../view-instruments-specifications/entities/view-instruments-specifications.entity';
import { ViewInstrumentsSpecificationsPermissions } from '../view-instruments-specifications/view-instruments-specifications.permissions';
import { ReportAccountStatementsPermissions } from "../report-account-statements/report-account-statements.permissions";
import { ReportAccountStatement } from "../report-account-statements/entities/report-account-statement.entity";
import { ReportBalanceOperationsPermissions } from "../report-balance-operations/report-balance-operations.permissions";
import { ReportBalanceOperation } from "../report-balance-operations/entities/report-balance-operation.entity";
import { ReportSwapsPermissions } from "../report-swaps/report-swaps.permissions";
import { ReportSwap } from "../report-swaps/entities/report-swap.entity";
import { ReportTradesPermissions } from "../report-trades/report-trades.permissions";
import { ReportTrade } from "../report-trades/entities/report-trade.entity";

export enum Permissions {
  VIEW_LIQUIDITY = 'view_liquidity',
  MANAGE_LIQUIDITY = 'manage_liquidity',
}

export const Liquidity = 'Liquidity' as const;
export const Quotes = 'Quotes' as const;

export const subjects = [
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
  SubloginSettings,
  ViewInstrumentsSpecification,
  Liquidity,
  Quotes,
  Position,
  RealTimeData,
  UserInfo,
];

@Module({})
export class CaslPermissionsModule {
  constructor() {
    const permissions = [
      {
        permission: Permissions.VIEW_LIQUIDITY,
        action: Action.Read,
        subject: subjects,
      },
      {
        permission: Permissions.MANAGE_LIQUIDITY,
        action: Action.Manage,
        subject: subjects,
      },
      {
        permission: MyInstrumentsPermissions.VIEW,
        action: Action.Read,
        subject: MyInstrument,
      },
      {
        permission: MySubloginSettingsPermissions.VIEW,
        action: Action.Read,
        subject: MySubloginSettings,
      },
      {
        permission: MySubloginSettingsPermissions.MANAGE,
        action: Action.Manage,
        subject: MySubloginSettings,
      },
      {
        permission: MyUsersSubAccountsInstPermissions.VIEW,
        action: Action.Read,
        subject: MyUsersSubAccountsInst,
      },
      {
        permission: MyUsersSubAccountsInstPermissions.MANAGE,
        action: Action.Manage,
        subject: MyUsersSubAccountsInst,
      },
      {
        permission: ViewInstrumentsSpecificationsPermissions.VIEW,
        action: Action.Read,
        subject: ViewInstrumentsSpecification,
      },
      {
        permission: MyAuditLogsPermissions.VIEW,
        action: Action.Read,
        subject: MyAuditLog,
      },
      {
        permission: ReportAccountStatementsPermissions.VIEW,
        action: Action.Read,
        subject: ReportAccountStatement,
      },
      {
        permission: ReportBalanceOperationsPermissions.VIEW,
        action: Action.Read,
        subject: ReportBalanceOperation,
      },
      {
        permission: ReportSwapsPermissions.VIEW,
        action: Action.Read,
        subject: ReportSwap,
      },
      {
        permission: ReportTradesPermissions.VIEW,
        action: Action.Read,
        subject: ReportTrade,
      }
    ];

    permissions.forEach(CaslAbilityFactory.addPermissionToAction);
  }
}
