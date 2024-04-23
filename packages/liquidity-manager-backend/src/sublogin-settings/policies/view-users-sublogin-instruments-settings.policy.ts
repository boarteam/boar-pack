import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { SubloginSettings } from "../entities/sublogin-settings.entity";

export class ViewSubloginSettingsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, SubloginSettings);
  }
}
