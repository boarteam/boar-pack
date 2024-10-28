import { Module } from "@nestjs/common";
import { MySubloginsSettingsController } from "./my-sublogin-settings.controller";
import { SubloginsSettingsModule } from "../sublogin-settings/sublogins-settings.module";

@Module({
  imports: [
    SubloginsSettingsModule,
  ],
  controllers: [
    MySubloginsSettingsController,
  ],
  providers: [],
  exports: [],
})
export class MySubloginSettingsModule {}

