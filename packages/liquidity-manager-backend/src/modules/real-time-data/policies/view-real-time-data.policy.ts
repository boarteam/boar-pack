import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";

export const RealTimeData = 'RealTimeData' as const;

export class ViewRealTimeDataPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, RealTimeData);
  }
}
