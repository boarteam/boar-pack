import { MyUsersSubAccountsInst } from "./policies/view-my-users-sub-accounts-inst.policy";

export * from '@jifeon/boar-pack-users-backend';

declare module '@jifeon/boar-pack-users-backend' {
  interface TSubjects {
    MyUsersSubAccountsInst: typeof MyUsersSubAccountsInst;
  }
}
