import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { UsersInst } from "../entities/users-inst.entity";

export class ManageUsersInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, UsersInst);
  }
}
