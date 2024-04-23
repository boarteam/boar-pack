import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { UsersGroupsInst } from "../entities/users-groups-inst.entity";

export class ViewUsersGroupsInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, UsersGroupsInst);
  }
}