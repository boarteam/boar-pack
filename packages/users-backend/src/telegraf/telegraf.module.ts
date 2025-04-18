import { DynamicModule, Module } from "@nestjs/common";
import { TelegrafService } from "./telegraf.service";
import { SettingsModule } from "../settings/settings.module";
import { TelegrafController } from "./telegraf.controller";

@Module({})
export class TelegrafModule {
  static register(config: {
    withControllers: boolean,
    dataSourceName: string,
  }): DynamicModule {
    return {
      module: TelegrafModule,
      imports: [
        SettingsModule.register({ withControllers: false, dataSourceName: config.dataSourceName }),
      ],
      controllers: config.withControllers ? [
        TelegrafController,
      ] : [],
      providers: [
        TelegrafService,
      ],
      exports: [
        TelegrafService,
      ],
    };
  }
}
