import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";
import { ReportSwap } from "../entities/report-swap.entity";

export class ViewReportSwapsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, ReportSwap);
  }
}
