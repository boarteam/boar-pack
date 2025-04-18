import { Setting } from "../entities/setting.entity";
import { Action, AppAbility, IPolicyHandler } from "../../casl";

export class ManageSettingsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, Setting);
  }
}
