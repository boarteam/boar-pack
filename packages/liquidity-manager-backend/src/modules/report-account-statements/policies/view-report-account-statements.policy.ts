import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";
import { ReportAccountStatement } from "../entities/report-account-statement.entity";

export class ViewReportAccountStatementsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, ReportAccountStatement);
  }
}
