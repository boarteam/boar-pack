import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EventLog, LogLevel } from './entities/event-log.entity';
import { EventLogsService } from "./event-logs.service";
import { Request, Response } from 'express';
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { SERVICE_CONFIG_TOKEN } from "./evnet-logs.constants";
import { TEventLogServiceConfig } from "./evnet-logs.types";

@Injectable()
export class EventLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventLogInterceptor.name);

  constructor(
    private readonly eventLogService: EventLogsService,
    @Inject(SERVICE_CONFIG_TOKEN) private readonly serviceConfig?: TEventLogServiceConfig,
  ) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest() as Request;
    const response = context.switchToHttp().getResponse() as Response;
    const handler = context.getHandler();
    const controller = context.getClass();

    const logEntry = new EventLog();
    logEntry.action = handler.name;
    logEntry.entity = controller.name;

    if (this.serviceConfig) {
      logEntry.service = this.serviceConfig.name;
      logEntry.serviceId = this.serviceConfig.id || null;
    }

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        logEntry.duration = Date.now() - now;
        logEntry.statusCode = response.statusCode;
        logEntry.logLevel = response.statusCode >= 500 ? LogLevel.ERROR : (response.statusCode >= 400 ? LogLevel.WARNING : LogLevel.INFO);
        this.eventLogService.audit(logEntry, request).catch((error) => {
          this.logger.error(`Failed to log event: ${error.message}`);
        });
      }),
      catchError((error: HttpException) => {
        logEntry.duration = Date.now() - now;
        logEntry.statusCode = error?.getStatus?.() || 500;
        logEntry.logLevel = logEntry.statusCode >= 500 ? LogLevel.ERROR : LogLevel.WARNING;
        this.eventLogService.audit(logEntry, request).catch((error) => {
          this.logger.error(`Failed to log event: ${error.message}`);
        });
        return throwError(() => error);
      }),
    );
  }
}
