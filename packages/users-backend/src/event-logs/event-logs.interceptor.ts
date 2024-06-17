import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EventLog, LogType, UserRole } from './entities/event-log.entity';
import { EventLogsService } from "./event-logs.service";
import { Request, Response } from 'express';
import { Roles } from "../users";
import { HttpException } from "@nestjs/common/exceptions/http.exception";

@Injectable()
export class EventLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventLogInterceptor.name);

  constructor(
    private readonly eventLogService: EventLogsService,
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

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        logEntry.duration = Date.now() - now;
        logEntry.statusCode = response.statusCode;
        this.eventLogService.audit(logEntry, request).catch((error) => {
          this.logger.error(`Failed to log event: ${error.message}`);
        });
      }),
      catchError((error: HttpException) => {
        logEntry.duration = Date.now() - now;
        logEntry.statusCode = error.getStatus();
        this.eventLogService.audit(logEntry, request).catch((error) => {
          this.logger.error(`Failed to log event: ${error.message}`);
        });
        return throwError(() => error);
      }),
    );
  }
}
