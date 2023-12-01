import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { EcnModule } from "../entities/ecn-module.entity";

export class ManageEcnModulesPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnModule);
  }
}

