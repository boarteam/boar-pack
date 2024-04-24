import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { UsersSubAccountInst } from "../entities/users-sub-account-inst.entity";

export class ViewUsersSubAccountsInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, UsersSubAccountInst);
  }
}
