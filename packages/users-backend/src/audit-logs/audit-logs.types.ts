import { AuditLog } from "./entities/audit-log.entity";

export * from '../index';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    AuditLog: typeof AuditLog;
  }
}
