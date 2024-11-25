import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";

export const UserInfo = 'UserInfo' as const;

export class ViewUserInfoPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, UserInfo);
  }
}
