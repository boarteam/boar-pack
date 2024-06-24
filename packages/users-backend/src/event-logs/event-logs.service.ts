import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EventLog, LogType, UserRole } from './entities/event-log.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Roles } from "../users";

@Injectable()
export class EventLogsService extends TypeOrmCrudService<EventLog> {
  private static requestHandled = Symbol('requestHandled');

  private readonly logger = new Logger(EventLogsService.name);

  private static readonly rolesMap = {
    [Roles.USER]: UserRole.USER,
    [Roles.ADMIN]: UserRole.ADMIN,
  }

  constructor(
    readonly repo: Repository<EventLog>,
  ) {
    super(repo);
  }

  async audit(eventLog: Partial<EventLog>, request?: Request): Promise<void> {
    // @ts-ignore
    if (request?.[EventLogsService.requestHandled]) {
      this.logger.debug('Request already handled');
      return;
    }

    const logPartial: Partial<EventLog> = {};
    if (request) {
      const { user } = request;
      const userRole = user?.role ? EventLogsService.rolesMap[user.role] : UserRole.GUEST;

      logPartial.userId = user?.id || null;
      logPartial.userRole = userRole || UserRole.GUEST;
      logPartial.payload = request.body || null;
      logPartial.method = request.method || null;
      logPartial.url = request.url || null;
      logPartial.entityId = request.params.id || null;
      logPartial.ipAddress = request.ip || null;
      logPartial.userAgent = request.headers['user-agent'] || null;
    }

    // @ts-ignore
    request[EventLogsService.requestHandled] = true;

    await this.repo.save({
      ...logPartial,
      ...eventLog,
      logType: LogType.AUDIT,
    });
  }
}
