import { ArgumentsHost, Catch, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EventLog, LogLevel } from './entities/event-log.entity';
import { Request } from 'express';
import { EventLogsService } from "./event-logs.service";
import { BaseExceptionFilter } from '@nestjs/core';
import { SERVICE_CONFIG_TOKEN } from "./event-logs.constants";
import { TEventLogServiceConfig } from "./event-logs.types";

@Injectable()
@Catch()
export class EventLogsExceptionFilter extends BaseExceptionFilter {
  constructor(
    private readonly eventLogsService: EventLogsService,
    @Inject(SERVICE_CONFIG_TOKEN) private readonly serviceConfig: TEventLogServiceConfig,
  ) {
    super();
  }

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const entity = request.url.split('?')[0]
      .split('/')
      .filter((part) => part)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')

    const logEntry = new EventLog();
    logEntry.action = 'Access';
    logEntry.entity = entity
    logEntry.duration = 0; // Duration is 0 because we log immediately on exception
    logEntry.statusCode = status;
    logEntry.logLevel = status >= 500 ? LogLevel.ERROR : LogLevel.WARNING;

    if (this.serviceConfig) {
      logEntry.service = this.serviceConfig.name;
      logEntry.serviceId = this.serviceConfig.id || null;
    }

    await this.eventLogsService.audit(logEntry, request);

    return super.catch(exception, host);
  }
}
