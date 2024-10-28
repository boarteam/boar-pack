import { LiquidityManager } from "./tools/api-client";

export default function () {
  return {
    canViewSomeLiquidityManager: true,
    canManageLiquidity: (lm?: LiquidityManager | null) => true,
    canManageOwnLiquidity: (lm?: LiquidityManager | null) => true,
    canManageLiquidityManagersSettings: true,
    canViewLiquidityManagersSettings: true,
    canGenerateResetPasswordLink: true,
  };
}
