import { DynamicModule, InjectionToken, Module, OptionalFactoryDependency } from "@nestjs/common";
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { TelegrafModule } from "@boarteam/boar-pack-users-backend";
import { ProviderMonitoringController } from "./provider-monitoring.controller";
import { SettingsModule } from "@boarteam/boar-pack-users-backend";
import { FETCH_PROVIDERS } from "./provider-monitoring.constants";
import { Type } from "@nestjs/common/interfaces/type.interface";
import { ForwardReference } from "@nestjs/common/interfaces/modules/forward-reference.interface";

// All providers should have at least these fields
export type TProvider = {
  id: string,
  name: string,
  threshold: number | null,
}

@Module({})
export class ProviderMonitoringModule {
  static forRootAsync(config: {
    dataSourceName: string,
    useFactory: <TProvider, TProviderService>(service: TProviderService) => () => Promise<TProvider[]>,
    inject?: (InjectionToken | OptionalFactoryDependency)[],
    imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>,
  }): DynamicModule {
    return {
      module: ProviderMonitoringModule,
      imports: [
        ...(Array.isArray(config.imports) ? config.imports : []),
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
