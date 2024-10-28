import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export const MyUsersSubAccountsInst = 'MyUsersSubAccountsInst' as const;

export class ViewMyUsersSubAccountsInstPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, MyUsersSubAccountsInst);
  }
}
