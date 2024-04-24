import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { EcnInstrumentsGroup } from "../entities/ecn-instruments-group.entity";

export class ViewEcnInstrumentsGroupsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, EcnInstrumentsGroup);
  }
}
