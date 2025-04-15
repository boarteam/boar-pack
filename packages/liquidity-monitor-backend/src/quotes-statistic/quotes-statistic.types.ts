import { QuotesStatistic } from "./entities/quotes-statistic.entity";

export * from '@boarteam/boar-pack-users-backend';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    QuotesStatistic: typeof QuotesStatistic;
  }
}
