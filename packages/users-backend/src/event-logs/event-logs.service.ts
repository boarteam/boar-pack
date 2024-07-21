import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EventLog, LogLevel, LogType, UserRole } from './entities/event-log.entity';
import { DataSource, Repository } from 'typeorm';
import { Request } from 'express';
import { Roles } from "../users";
import { EventLogTimelineDto } from "./dto/event-log-timeline.dto";
import moment from "moment";

type TInterval = 'second' | 'minute' | 'hour' | 'day' | 'week';

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
    private readonly dataSource: DataSource,
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

  async operationalLog(eventLog: Partial<EventLog>): Promise<void> {
    await this.repo.save({
      logLevel: LogLevel.INFO,
      userRole: UserRole.SYSTEM,
      ...eventLog,
      logType: LogType.OPERATIONAL,
    });
  }

  public applicationLog(eventLog: Partial<EventLog>): void {
    this.repo.save({
      logLevel: LogLevel.INFO,
      userRole: UserRole.SYSTEM,
      ...eventLog,
      logType: LogType.APPLICATION,
    }).catch(e => {
      // DO NOT USE LOGGER HERE - it will cause infinite loop
      console.error('Error while saving application log');
      console.error(e);
    });
  }

  async getTimeline(startTime?: Date, endTime?: Date, timezone?: string): Promise<EventLogTimelineDto[]> {
    if (!startTime) {
      startTime = await this.getOldestLogDate();
    }

    if (!endTime) {
      endTime = new Date();
    }

    let startMoment = moment(startTime);
    let endMoment = moment(endTime);

    const interval = this.determineInterval(startMoment, endMoment);
    const formatTimeFunction = this.getFormatTimeFunction(interval, timezone);

    const startTimeIntervalBegin = startMoment.clone().startOf(interval as moment.unitOfTime.StartOf);
    const endTimeIntervalBegin = endMoment.clone().startOf(interval as moment.unitOfTime.StartOf);

    return this.dataSource.query(`
      with 
        time_series as (select generate_series($1, $2, '1 ${interval}'::interval) as time),
        log_levels as (select unnest(enum_range(null::event_logs_log_level_enum)) as loglevel)
      select
        ${formatTimeFunction} as time,
        ll.loglevel as "logLevel",
        coalesce(count(el.*)::int, 0) as records,
        ts.time as "startTime",
        ts.time + interval '1 ${interval}' as "endTime"
      from time_series ts
        cross join log_levels ll
        left join event_logs el on date_trunc('${interval}', el.created_at, $5) = ts.time
        and el.log_level = ll.loglevel
        and el.created_at at time zone $5 between $3 and $4
      group by ts.time,
        ll.loglevel
      order by ts.time,
        ll.loglevel;
    `, [
      startTimeIntervalBegin.toDate(),
      endTimeIntervalBegin.toDate(),
      startMoment.toDate(),
      endMoment.toDate(),
      timezone
    ]);
  }

  private async getOldestLogDate(): Promise<Date> {
    const oldestLog = await this.repo.createQueryBuilder('event_log')
      .select('MIN(event_log.createdAt)', 'min')
      .getRawOne();
    return new Date(oldestLog.min);
  }

  private determineInterval(startTime: moment.Moment, endTime: moment.Moment): TInterval {
    const duration = moment.duration(endTime.diff(startTime));

    const totalSeconds = duration.asSeconds();
    const totalMinutes = duration.asMinutes();
    const totalHours = duration.asHours();
    const totalDays = duration.asDays();
    const totalWeeks = duration.asWeeks();

    // Aim for approximately 50-100 bars
    const targetBars = 75;

    if (totalSeconds <= targetBars) {
      return 'second';
    } else if (totalMinutes <= targetBars) {
      return 'minute';
    } else if (totalHours <= targetBars) {
      return 'hour';
    } else if (totalDays <= targetBars) {
      return 'day';
    } else if (totalWeeks <= targetBars) {
      return 'week';
    } else {
      return 'week'; // fallback to week for very large ranges
    }
  }

  private getFormatTimeFunction(interval: TInterval, timezone: string = 'UTC'): string {
    switch (interval) {
      case 'second':
        return `to_char(ts.time at time zone '${timezone}', 'HH24:MI:SS')`;
      case 'minute':
        return `to_char(ts.time at time zone '${timezone}', 'HH24:MI')`;
      case 'hour':
        return `to_char(ts.time at time zone '${timezone}', 'HH24:MI')`;
      case 'day':
        return `to_char(ts.time at time zone '${timezone}', 'YYYY-MM-DD')`;
      case 'week':
        return `to_char(date_trunc('week', ts.time at time zone '${timezone}'), 'YYYY-MM-DD')`;
      default:
        return `to_char(date_trunc('week', ts.time at time zone '${timezone}'), 'YYYY-MM-DD')`;
    }
  }
}
