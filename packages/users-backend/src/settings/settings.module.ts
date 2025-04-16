import { DynamicModule, Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { Setting } from "./entities/setting.entity";
import { DataSource } from "typeorm";
import { Action, CaslAbilityFactory } from "../casl";
import { SettingsPermissions } from "./settings.permissions";

@Module({})
export class SettingsModule {
  static register(config: {
    withControllers: boolean,
    dataSourceName: string,
  }): DynamicModule {
    return {
      module: SettingsModule,
      imports: [
        TypeOrmModule.forFeature([Setting], config.dataSourceName),
      ],
      controllers: config.withControllers ? [
        SettingsController,
      ] : [],
      providers: [
        {
          provide: SettingsService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new SettingsService(dataSource.getRepository(Setting));
          }
        }
      ],
      exports: [
        SettingsService,
      ],
    };
  }

  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: SettingsPermissions.MANAGE,
      action: Action.Manage,
      subject: Setting,
    },);

  }
}
