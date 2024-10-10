import { MyInstrument } from "./policies/view-my-instruments.policy";

export * from '@jifeon/boar-pack-users-backend';

declare module '@jifeon/boar-pack-users-backend' {
  interface TSubjects {
    MyInstrument: typeof MyInstrument;
  }
}
