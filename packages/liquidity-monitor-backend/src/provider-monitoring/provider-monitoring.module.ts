import { Module } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { TelegrafModule } from "@boarteam/boar-pack-users-backend";

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
