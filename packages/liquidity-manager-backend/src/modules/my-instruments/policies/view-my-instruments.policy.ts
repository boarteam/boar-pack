import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export const MyInstrument = 'MyInstrument' as const;

export class ViewMyInstrumentsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, MyInstrument);
  }
}
