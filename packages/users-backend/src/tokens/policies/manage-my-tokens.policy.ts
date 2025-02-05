import { Action, AppAbility, IPolicyHandler } from "../../casl";

export const MyToken = 'MyToken' as const;

export class ManageMyTokensPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, MyToken);
  }
}
