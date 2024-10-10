import { Permissions } from "../casl-permissions";
import { MyInstrumentsPermissions } from "../my-instruments/my-instruments.permissions";

export const defaultPermissions = [
  Permissions.VIEW_LIQUIDITY,
  MyInstrumentsPermissions.VIEW
];
