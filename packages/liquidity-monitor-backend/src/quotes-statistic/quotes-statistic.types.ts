import { QuotesStatistic } from "./entities/quotes-statistic.entity";

export * from '@boarteam/boar-pack-users-backend';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    QuotesStatistic: typeof QuotesStatistic;
  }
}
// All providers should have at least these fields
export type TProvider = {
  id: string,
  name: string,
  threshold: number | null,
  // TODO: remove activeRanges from here?
  activeRanges: [number, number][];
}
