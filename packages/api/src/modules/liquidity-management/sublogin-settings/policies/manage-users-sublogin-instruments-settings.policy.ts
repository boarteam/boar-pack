import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { SubloginSettings } from "../entities/sublogin-settings.entity";

export class ManageSubloginSettingsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, SubloginSettings);
  }
}
