import { MySubloginSettings } from "./policies/view-my-sublogin-settings.policy";

export * from '@jifeon/boar-pack-users-backend';

declare module '@jifeon/boar-pack-users-backend' {
  interface TSubjects {
    MySubloginSettings: typeof MySubloginSettings;
  }
}
