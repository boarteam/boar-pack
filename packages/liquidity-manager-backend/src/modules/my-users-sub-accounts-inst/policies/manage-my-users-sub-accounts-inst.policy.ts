import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export const MyUsersSubAccountsInst = 'MyUsersSubAccountsInst' as const;

export class ManageMyUsersSubAccountsInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, MyUsersSubAccountsInst);
  }
}
