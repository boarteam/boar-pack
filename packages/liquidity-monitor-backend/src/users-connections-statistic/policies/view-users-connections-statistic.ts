import { Action, AppAbility, IPolicyHandler } from "@boarteam/boar-pack-users-backend";
import { UsersConnectionsStatistic } from "../entities/users-connections-statistic.entity";

export class ViewUsersConnectionsStatistic implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, UsersConnectionsStatistic);
  }
}
