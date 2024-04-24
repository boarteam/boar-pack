import { EcnInstrument } from "../entities/ecn-instrument.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export class ManageEcnInstrumentsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnInstrument);
  }
}

