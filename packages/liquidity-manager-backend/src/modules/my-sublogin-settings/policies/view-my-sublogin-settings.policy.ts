import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export const MySubloginSettings = 'MySubloginSettings' as const;

export class ViewMySubloginSettingsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, MySubloginSettings);
  }
}
