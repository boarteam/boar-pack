import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { UsersInst } from "../entities/users-inst.entity";

export class ManageUsersInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, UsersInst);
  }
}
