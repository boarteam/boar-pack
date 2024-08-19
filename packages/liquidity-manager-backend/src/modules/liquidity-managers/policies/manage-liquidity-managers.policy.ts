import { LiquidityManager } from "../entities/liquidity-manager.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";

export class ManageLiquidityManagersPolicy implements IPolicyHandler {
  handle(ability?: AppAbility) {
    if (!ability) {
      return false;
    }

    return ability.can(Action.Manage, LiquidityManager);
  }
}
