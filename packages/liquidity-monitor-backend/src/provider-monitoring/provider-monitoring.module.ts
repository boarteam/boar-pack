import { Module } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { TelegrafModule } from "@boarteam/boar-pack-users-backend";
import { ProviderMonitoringController } from "./provider-monitoring.controller";
import { SettingsModule } from "@boarteam/boar-pack-users-backend";

@Module({})
export class ProviderMonitoringModule {
  static forRoot(config: {
    dataSourceName: string,
  }) {
    return {
      module: ProviderMonitoringModule,
      imports: [
        TelegrafModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
        SettingsModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
      ],
      controllers: [
        ProviderMonitoringController
      ],
      providers: [
        ProviderMonitoringService,
      ],
      exports: [
        ProviderMonitoringService,
      ],
    };
  }
}
