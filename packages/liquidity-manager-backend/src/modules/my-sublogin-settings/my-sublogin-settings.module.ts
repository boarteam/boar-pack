import { Module } from "@nestjs/common";
import { MySubloginsSettingsController } from "./my-sublogin-settings.controller";
import { SubloginsSettingsModule } from "../sublogin-settings/sublogins-settings.module";
import { UsersSubAccountsInstModule } from "../users-sub-accounts-inst/users-sub-accounts-inst.module";

@Module({
  imports: [
    SubloginsSettingsModule,
    UsersSubAccountsInstModule,
  ],
  controllers: [
    MySubloginsSettingsController,
  ],
  providers: [],
  exports: [],
})
export class MySubloginSettingsModule {}

