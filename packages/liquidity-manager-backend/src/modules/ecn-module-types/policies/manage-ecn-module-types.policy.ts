import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { EcnModuleType } from "../entities/ecn-module-type.entity";

export class ManageEcnModuleTypesPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnModuleType);
  }
}

