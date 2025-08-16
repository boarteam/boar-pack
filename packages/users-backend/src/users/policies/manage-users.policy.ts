import { IPolicyHandler } from "../../casl/policies.guard";
import { AppAbility } from "../../casl/casl-ability.factory";
import { Action } from "../../casl/action.enum";
import { User } from "../entities/user.entity";

export class ManageUsersPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, User);
  }
}
