import { AuditLog } from "./entities/audit-log.entity";

export * from '@boarteam/boar-pack-users-backend';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    AuditLog: typeof AuditLog;
  }
}
