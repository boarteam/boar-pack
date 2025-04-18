import { Module } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { TelegrafModule } from "@boarteam/boar-pack-users-backend";
import { ScheduleModule } from "@nestjs/schedule";

@Module({})
export class ProviderMonitoringModule {
  static forRoot(config: {
    dataSourceName: string,
  }) {
    const scheduleModule = process.env.SWAGGER ? [] : [ScheduleModule.forRoot()];

    return {
      module: ProviderMonitoringModule,
      imports: [
        ...scheduleModule,
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
