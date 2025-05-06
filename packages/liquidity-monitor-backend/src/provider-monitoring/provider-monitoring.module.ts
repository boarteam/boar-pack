import { DynamicModule, Module } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { TelegrafModule } from "@boarteam/boar-pack-users-backend";
import { ProviderMonitoringController } from "./provider-monitoring.controller";
import { SettingsModule } from "@boarteam/boar-pack-users-backend";
import { FETCH_PROVIDERS } from "./provider-monitoring.constants";

@Module({})
export class ProviderMonitoringModule {
  static forRootAsync(config: {
    dataSourceName: string,
    useFactory: (...args: any[]) => () => Promise<any[]>,
    inject?: any[],
    imports?: any[],
  }): DynamicModule {
    return {
      module: ProviderMonitoringModule,
      imports: [
        ...(config.imports || []),
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
        {
          provide: FETCH_PROVIDERS,
          inject: config.inject,
          useFactory: config.useFactory,
        },
      ],
      exports: [
        ProviderMonitoringService,
      ],
    };
  }
}
