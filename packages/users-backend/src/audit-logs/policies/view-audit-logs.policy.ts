import { IPolicyHandler, AppAbility, Action } from "../../casl";
import { AuditLog } from "../entities/audit-log.entity";

export class ViewAuditLogsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, AuditLog);
  }
}
