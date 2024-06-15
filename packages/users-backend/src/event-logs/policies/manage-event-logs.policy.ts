import { EventLog } from "../entities/event-log.entity";
import { Action, AppAbility, IPolicyHandler } from "../../casl";

export class ManageEventLogsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EventLog);
  }
}
