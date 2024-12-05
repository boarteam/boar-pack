import { NamedLogger } from "@boarteam/boar-pack-common-backend/src/tools";
import { EventLogsService } from "./event-logs.service";
import { Inject } from "@nestjs/common";
import { SERVICE_CONFIG_TOKEN } from "./event-logs.constants";
import type { TEventLogServiceConfig } from "./event-logs.types";
import { LogLevel } from "./entities/event-log.entity";

export class EventLogsLogger extends NamedLogger {
  constructor(
    private readonly eventLogsService: EventLogsService,
    @Inject(SERVICE_CONFIG_TOKEN) private readonly serviceConfig: TEventLogServiceConfig,
  ) {
    const { id, name } = serviceConfig || {};
    const prefix = id ? `${name} (${id})` : name;
    super(prefix);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    this.eventLogsService.applicationLog({
      action: 'log',
      entity: 'EventLogsLogger',
      service: this.serviceConfig.name,
      serviceId: this.serviceConfig.id,
      logLevel: LogLevel.WARNING,
      payload: {
        message: String(message),
        ...optionalParams?.length && { optionalParams },
      },
    });
  }

  error(message: any, stack: any, ...optionalParams: any[]) {
    super.error(message, stack, ...optionalParams);
    this.eventLogsService.applicationLog({
      action: 'log',
      entity: 'EventLogsLogger',
      service: this.serviceConfig.name,
      serviceId: this.serviceConfig.id,
      logLevel: LogLevel.ERROR,
      payload: {
        message: String(message),
        ...stack && { stack },
        ...optionalParams?.length && { optionalParams },
      },
    });
  }
}
