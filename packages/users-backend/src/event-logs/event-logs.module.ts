import { Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { EventLogsService } from './event-logs.service';
import { EventLogsController } from './event-logs.controller';
import { EventLog } from './entities/event-log.entity';
import { EventLogsPermissions } from "./event-logs.permissions";
import { Action, CaslAbilityFactory, CaslModule } from "../casl";
import { DataSource } from "typeorm";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { EventLogInterceptor } from "./event-logs.interceptor";

@Module({})
export class EventLogsModule {
  static forRoot(config: { dataSourceName: string }) {
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
            return new EventLogsService(dataSource.getRepository(EventLog));
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

  static forInterceptor(config: { dataSourceName: string }) {
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
            return new EventLogsService(dataSource.getRepository(EventLog));
          }
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: EventLogInterceptor,
        },
      ],
      exports: [],
    }
  }

  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: EventLogsPermissions.VIEW,
      action: Action.Read,
      subject: EventLog,
    });
    CaslAbilityFactory.addPermissionToAction({
      permission: EventLogsPermissions.MANAGE,
      action: Action.Manage,
      subject: EventLog,
    })
  }
}
