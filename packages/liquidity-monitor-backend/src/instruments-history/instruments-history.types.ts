import { InstrumentsHistory } from "./entities/instruments-history.entity";

export * from '@boarteam/boar-pack-users-backend';

declare module '@boarteam/boar-pack-users-backend' {
  interface TSubjects {
    InstrumentsHistory: typeof InstrumentsHistory;
  }
}
