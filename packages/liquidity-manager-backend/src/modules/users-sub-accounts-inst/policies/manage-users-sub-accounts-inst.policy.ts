import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { UsersSubAccountInst } from "../entities/users-sub-account-inst.entity";

export class ManageUsersSubAccountsInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, UsersSubAccountInst);
  }
}