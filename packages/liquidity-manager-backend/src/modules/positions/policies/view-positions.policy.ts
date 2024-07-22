import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";

export class ViewPositionsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, 'Position');
  }
}
