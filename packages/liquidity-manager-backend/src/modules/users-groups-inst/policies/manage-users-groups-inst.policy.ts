import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { UsersGroupsInst } from "../entities/users-groups-inst.entity";

export class ManageUsersGroupsInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, UsersGroupsInst);
  }
}
