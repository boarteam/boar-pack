import { MyAuditLog } from "./policies/view-my-audit-logs.policy";

export * from '@jifeon/boar-pack-users-backend';

declare module '@jifeon/boar-pack-users-backend' {
  interface TSubjects {
    MyAuditLog: typeof MyAuditLog;
  }
}
