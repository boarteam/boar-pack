import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export const MyAuditLog = 'MyAuditLog' as const;

export class ViewMyAuditLogsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, MyAuditLog);
  }
}
