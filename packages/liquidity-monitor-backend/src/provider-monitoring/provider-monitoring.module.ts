import { DynamicModule, InjectionToken, Module, OptionalFactoryDependency } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { SettingsModule, SettingsService, TelegrafModule, TelegrafService } from "@boarteam/boar-pack-users-backend";
import { ProviderMonitoringController } from "./provider-monitoring.controller";
import { FETCH_PROVIDERS } from "./provider-monitoring.constants";
import { Type } from "@nestjs/common/interfaces/type.interface";
import { ForwardReference } from "@nestjs/common/interfaces/modules/forward-reference.interface";
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
    fetchProviders: (service: TLocalService) => Promise<TLocalProvider[]>,
    inject?: (InjectionToken | OptionalFactoryDependency)[],
    imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>,
  }): DynamicModule {
    return {
      module: ProviderMonitoringModule,
      imports: [
        ...(Array.isArray(config.imports) ? config.imports : []),
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
      controllers: [
        ProviderMonitoringController
      ],
      providers: [
        {
          provide: FETCH_PROVIDERS,
          inject: config.inject,
          useFactory: (providersService) => {
            return () => config.fetchProviders(providersService);
          },
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
