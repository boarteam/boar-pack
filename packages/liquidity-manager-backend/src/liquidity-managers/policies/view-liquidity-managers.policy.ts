import { LiquidityManager } from "../entities/liquidity-manager.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";

export class ViewLiquidityManagersPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, LiquidityManager);
  }
}
