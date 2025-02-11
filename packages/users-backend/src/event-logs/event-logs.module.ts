import { Inject, MiddlewareConsumer, Module, NestModule, Optional } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { EventLogsService } from './event-logs.service';
import { EventLogsController } from './event-logs.controller';
import { EventLog } from './entities/event-log.entity';
import { EventLogsPermissions } from "./event-logs.permissions";
import { Action, CaslAbilityFactory, CaslModule } from "../casl";
import { DataSource } from "typeorm";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { EventLogInterceptor } from "./event-logs.interceptor";
import { CONFIGURE_EVENTS_MIDDLEWARE, SERVICE_CONFIG_TOKEN } from "./event-logs.constants";
import { TEventLogServiceConfig } from "./event-logs.types";
import { EventLogsLogger } from "./event-logs.logger";
import { EventLogMiddleware } from "./event-logs.middleware";
import { ScheduleModule } from "@nestjs/schedule";

@Module({})
export class EventLogsModule implements NestModule {
  static forRoot(config: { dataSourceName: string }) {
    return {
      module: EventLogsModule,
      imports: [
        CaslModule.forFeature(),
        TypeOrmModule.forFeature([EventLog], config.dataSourceName),
      ],
      providers: [
        {
          provide: EventLogsService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new EventLogsService(dataSource.getRepository(EventLog), dataSource);
          }
        },
      ],
      exports: [
        EventLogsService,
      ],
      controllers: [
        EventLogsController,
      ]
    }
  }

  static forInterceptor(config: {
    dataSourceName: string,
    service?: TEventLogServiceConfig,
    eventLogsServiceClass?: new (...args: any[]) => EventLogsService,
  }) {
    return {
      module: EventLogsModule,
      imports: [
        CaslModule.forFeature(),
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([EventLog], config.dataSourceName),
      ],
      providers: [
        {
          provide: EventLogsService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            const serviceClass = config.eventLogsServiceClass || EventLogsService;
            return new serviceClass(dataSource.getRepository(EventLog), dataSource);
          }
        },
        {
          provide: SERVICE_CONFIG_TOKEN,
          useValue: config.service,
        },
        EventLogsLogger,
        {
          provide: APP_INTERCEPTOR,
          useClass: EventLogInterceptor,
        },
        {
          provide: CONFIGURE_EVENTS_MIDDLEWARE,
          useValue: true,
        }
      ],
      exports: [
        EventLogsService,
        EventLogsLogger,
        CONFIGURE_EVENTS_MIDDLEWARE,
        SERVICE_CONFIG_TOKEN,
      ],
    }
  }

  static forFeature(config: { dataSourceName: string }) {
    return {
      module: EventLogsModule,
      imports: [
        CaslModule,
        TypeOrmModule.forFeature([EventLog], config.dataSourceName),
      ],
      providers: [
        {
          provide: EventLogsService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new EventLogsService(dataSource.getRepository(EventLog), dataSource);
          }
        },
      ],
      exports: [
        EventLogsService,
      ],
    }
  }

  constructor(
    @Optional()
    @Inject(CONFIGURE_EVENTS_MIDDLEWARE) private readonly configureEventsMiddleware: boolean,
  ) {
    CaslAbilityFactory.addPermissionToAction({
      permission: EventLogsPermissions.VIEW,
      action: Action.Read,
      subject: EventLog,
    });
    CaslAbilityFactory.addPermissionToAction({
      permission: EventLogsPermissions.MANAGE,
      action: Action.Manage,
      subject: EventLog,
    });
  }

  configure(consumer: MiddlewareConsumer) {
    if (this.configureEventsMiddleware) {
      consumer.apply(EventLogMiddleware).forRoutes('*');
    }
  }
}
