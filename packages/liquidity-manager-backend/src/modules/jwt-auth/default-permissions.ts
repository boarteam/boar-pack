import { Permissions } from "../casl-permissions";
import { MyInstrumentsPermissions } from "../my-instruments/my-instruments.permissions";
import { MyAuditLogsPermissions } from "../my-audit-logs";

export const defaultPermissions = [
  Permissions.VIEW_LIQUIDITY,
  MyInstrumentsPermissions.VIEW,
  MyAuditLogsPermissions.VIEW,
];
