import { DynamicModule, Module } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { SettingsModule, SettingsService, TelegrafModule, TelegrafService } from "@boarteam/boar-pack-users-backend";
import { FETCH_PROVIDERS } from "./provider-monitoring.constants";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { ProvidersProblematicPeriod } from "./entities/providers-problematic-period.entity";
import { DataSource } from "typeorm";

// All providers should have at least these fields
export type TProvider = {
  id: string,
  name: string,
  threshold: number | null,
}

@Module({})
export class ProviderMonitoringModule {
  static forRootAsync<TLocalProvider extends TProvider, TLocalService>(config: {
    dataSourceName: string,
    inject?: any[],
    imports?: any[],
    useFactory: (...args: any[]) => () => Promise<TLocalProvider[]>,
  }): DynamicModule {
    return {
      module: ProviderMonitoringModule,
      imports: [
        ...(config.imports || []),
        TypeOrmModule.forFeature([ProvidersProblematicPeriod], config.dataSourceName),
        TelegrafModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
        SettingsModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
      ],
      controllers: [],
      providers: [
        {
          provide: FETCH_PROVIDERS,
          inject: config.inject ?? [],
          useFactory: config.useFactory,
        },
        {
          provide: ProviderMonitoringService,
          inject: [
            getDataSourceToken(config.dataSourceName),
            TelegrafService,
            SettingsService,
            FETCH_PROVIDERS,
          ],
          useFactory: (
            dataSource: DataSource,
            telegrafService: TelegrafService,
            settingsService: SettingsService,
            fetchProviders: () => Promise<TLocalProvider[]>,
          ) => {
            return new ProviderMonitoringService(
              dataSource,
              telegrafService,
              settingsService,
              fetchProviders,
            );
          },
        },
      ],
      exports: [
        ProviderMonitoringService,
      ],
    };
  }
}
