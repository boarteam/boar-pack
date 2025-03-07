import { Injectable, NestMiddleware, Inject, Logger, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventLogsService } from './event-logs.service';
import { EventLog, LogLevel } from './entities/event-log.entity';
import { SERVICE_CONFIG_TOKEN } from './event-logs.constants';
import type { TEventLogServiceConfig } from './event-logs.types';

@Injectable()
export class EventLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EventLogMiddleware.name);

  constructor(
    private readonly eventLogService: EventLogsService,
    @Inject(SERVICE_CONFIG_TOKEN) private readonly serviceConfig?: TEventLogServiceConfig,
  ) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      if (this.eventLogService.requestAlreadyHandled(req)) {
        return;
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return;
      }

      const logEntry = new EventLog();
      logEntry.action = req.method;
      logEntry.entity = req.url.split('?')[0]
        .split('/')
        .filter((part) => part)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' ');

      if (this.serviceConfig) {
        logEntry.service = this.serviceConfig.name;
        logEntry.serviceId = this.serviceConfig.id || null;
      }


      logEntry.duration = Date.now() - start;
      logEntry.statusCode = res.statusCode;
      logEntry.logLevel =
        res.statusCode >= 500
          ? LogLevel.ERROR
          : res.statusCode >= 400
            ? LogLevel.WARNING
            : LogLevel.INFO;

      this.eventLogService.audit(logEntry, req);
    });

    next();
  }
}
