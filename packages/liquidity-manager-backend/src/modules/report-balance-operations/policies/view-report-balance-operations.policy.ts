import { IPolicyHandler, AppAbility, Action } from "@jifeon/boar-pack-users-backend";
import { ReportBalanceOperation } from "../entities/report-balance-operation.entity";

export class ViewReportBalanceOperationsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, ReportBalanceOperation);
  }
}
