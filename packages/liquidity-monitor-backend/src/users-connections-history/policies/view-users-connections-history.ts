import { Action, AppAbility, IPolicyHandler } from "@boarteam/boar-pack-users-backend";
import { UsersConnectionsHistory } from "../entities/users-connections-history.entity";

export class ViewUsersConnectionsHistory implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, UsersConnectionsHistory);
  }
}
