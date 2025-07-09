import { UsersConnectionsHistory } from "./entities/users-connections-history.entity";

export * from '@boarteam/boar-pack-users-backend';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    UsersConnectionsHistory: typeof UsersConnectionsHistory;
  }
}
