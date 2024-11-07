import { Permissions } from "../casl-permissions";
import { MyInstrumentsPermissions } from "../my-instruments/my-instruments.permissions";
import { MyAuditLogsPermissions } from "../my-audit-logs";
import { MyUsersSubAccountsInstPermissions } from "../my-users-sub-accounts-inst/my-users-sub-accounts-inst.permissions";
import { MySubloginSettingsPermissions } from "../my-sublogin-settings/my-sublogin-settings.permissions";
import { ViewInstrumentsSpecificationsPermissions } from "../view-instruments-specifications/view-instruments-specifications.permissions";
import { ReportAccountStatementsPermissions } from "../report-account-statements/report-account-statements.permissions";
import { ReportBalanceOperationsPermissions } from "../report-balance-operations/report-balance-operations.permissions";

export const defaultPermissions = [
  Permissions.VIEW_LIQUIDITY,
  MyInstrumentsPermissions.VIEW,
  MyAuditLogsPermissions.VIEW,
  MyUsersSubAccountsInstPermissions.VIEW,
  MyUsersSubAccountsInstPermissions.MANAGE,
  MySubloginSettingsPermissions.VIEW,
  MySubloginSettingsPermissions.MANAGE,
  ViewInstrumentsSpecificationsPermissions.VIEW,
  ReportAccountStatementsPermissions.VIEW,
  ReportBalanceOperationsPermissions.VIEW,
];
