import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { SubloginSettings } from "../entities/sublogin-settings.entity";

export class ManageSubloginSettingsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, SubloginSettings);
  }
}
