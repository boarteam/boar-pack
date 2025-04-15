import { QuotesStatistic } from "../entities/quotes-statistic.entity";
import { Action, AppAbility, IPolicyHandler } from "@boarteam/boar-pack-users-backend";

export class ViewQuotesStatisticPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, QuotesStatistic);
  }
}
