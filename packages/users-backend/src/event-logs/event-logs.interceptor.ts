import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventLog, LogType, UserRole } from './entities/event-log.entity';
import { EventLogsService } from "./event-logs.service";
import { Request, Response } from 'express';
import { Roles } from "../users";

@Injectable()
export class EventLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventLogInterceptor.name);

  private static readonly rolesMap = {
    [Roles.USER]: UserRole.USER,
    [Roles.ADMIN]: UserRole.ADMIN,
  }

  constructor(
    private readonly eventLogService: EventLogsService,
  ) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest() as Request;
    const response = context.switchToHttp().getResponse() as Response;
    const handler = context.getHandler();
    const controller = context.getClass();

    const { user } = request;
    const userRole = user?.role ? EventLogInterceptor.rolesMap[user.role] : UserRole.GUEST;
    const logEntry = new EventLog();
    logEntry.logType = LogType.AUDIT;
    logEntry.action = handler.name;
    logEntry.userId = user?.id || null;
    logEntry.userRole = userRole || UserRole.GUEST;
    logEntry.entity = controller.name;
    logEntry.entityId = request.params.id || null;
    logEntry.payload = request.body;
    logEntry.method = request.method;
    logEntry.url = request.url;
    logEntry.ipAddress = request.ip || null;
    logEntry.userAgent = request.headers['user-agent'] || null;

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        logEntry.duration = Date.now() - now;
        logEntry.statusCode = response.statusCode;
        this.eventLogService.create(logEntry).catch((error) => {
          this.logger.error(`Failed to log event: ${error.message}`);
        });
      }),
    );
  }
}
