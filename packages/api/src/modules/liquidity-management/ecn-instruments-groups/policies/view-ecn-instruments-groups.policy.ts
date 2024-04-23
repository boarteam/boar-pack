import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { EcnInstrumentsGroup } from "../entities/ecn-instruments-group.entity";

export class ViewEcnInstrumentsGroupsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, EcnInstrumentsGroup);
  }
}
