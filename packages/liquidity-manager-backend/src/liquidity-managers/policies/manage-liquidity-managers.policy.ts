import { LiquidityManager } from "../entities/liquidity-manager.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";

export class ManageLiquidityManagersPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, LiquidityManager);
  }
}
