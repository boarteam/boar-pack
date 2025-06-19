import { Action, AppAbility, IPolicyHandler } from "@boarteam/boar-pack-users-backend";
import { InstrumentsHistory } from "../entities/instruments-history.entity";

export class ViewInstrumentsHistory implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, InstrumentsHistory);
  }
}
