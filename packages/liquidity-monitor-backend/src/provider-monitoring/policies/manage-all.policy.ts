import { Action, AppAbility, IPolicyHandler } from "@boarteam/boar-pack-users-backend";

export class ManageAllPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, 'all');
  }
}
