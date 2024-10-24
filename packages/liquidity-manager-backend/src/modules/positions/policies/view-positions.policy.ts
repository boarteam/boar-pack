import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";

export const Position = 'Position' as const;

export class ViewPositionsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Position);
  }
}
