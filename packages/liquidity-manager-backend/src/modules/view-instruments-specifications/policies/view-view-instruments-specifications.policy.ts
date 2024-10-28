import { ViewInstrumentsSpecification as ViewInstrumentsSpecificationEntity } from "../entities/view-instruments-specifications.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export const ViewInstrumentsSpecificationSubject = 'ViewInstrumentsSpecificationSubject' as const;

export class ViewViewInstrumentsSpecificationsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, ViewInstrumentsSpecificationEntity);
  }
}

