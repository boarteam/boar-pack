import { UsersConnectionsStatistic } from "./entities/users-connections-statistic.entity";

export * from '@boarteam/boar-pack-users-backend';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    UsersConnectionsStatistic: typeof UsersConnectionsStatistic;
  }
}
