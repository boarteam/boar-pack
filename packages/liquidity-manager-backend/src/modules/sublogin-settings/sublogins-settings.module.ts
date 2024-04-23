import { DynamicModule, Module } from '@nestjs/common';
import { SubloginsSettingsService } from './sublogins-settings.service';
import { SubloginsSettingsController } from './sublogins-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../liquidity-app.config";
import { SubloginSettings } from "./entities/sublogin-settings.entity";

@Module({})
export class SubloginsSettingsModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: SubloginsSettingsModule,
      imports: [
        TypeOrmModule.forFeature([
          SubloginSettings,
        ], AMTS_DB_NAME),
      ],
      providers: [
        SubloginsSettingsService,
      ],
      exports: [
        SubloginsSettingsService,
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [SubloginsSettingsController];
    }

    return dynamicModule;
  }
}
