import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";
import { ReportTrade } from "../entities/report-trade.entity";

export class ViewReportTradesPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, ReportTrade);
  }
}
