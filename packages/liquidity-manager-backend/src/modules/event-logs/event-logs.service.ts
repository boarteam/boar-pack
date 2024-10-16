import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import 'moment-timezone';
import { EventLog, EventLogsService as BaseEventLogsService, UserRole } from "@jifeon/boar-pack-users-backend";

@Injectable()
export class EventLogsService extends BaseEventLogsService {
  async audit(eventLog: Partial<EventLog>, request?: Request): Promise<void> {
    if (request) {
      const { user } = request;

      eventLog.userId = null;
      eventLog.externalUserId = user?.id && String(user.id) || null;
      eventLog.userRole = eventLog.externalUserId !== null ? UserRole.USER : UserRole.GUEST;
      eventLog.userName = user?.name || null;
    }

    await super.audit(eventLog, request);
  }
}
