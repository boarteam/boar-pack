import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { EcnModuleType } from "../entities/ecn-module-type.entity";

export class ViewEcnModuleTypesPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, EcnModuleType);
  }
}

