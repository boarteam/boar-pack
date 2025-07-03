import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { UsersConnectionsStatisticDto } from "./dto/users-connections-statistic.dto";
import moment from "moment";
import { UserConnectionTarget, UsersConnectionsStatistic } from "./entities/users-connections-statistic.entity";

type TInterval = 'second' | 'minute' | 'hour' | 'day' | 'week';

type IUserQuotesNumber = { [key in UserConnectionTarget]: number };

@Injectable()
export class UsersConnectionsStatisticService {
  private readonly logger = new Logger(UsersConnectionsStatisticService.name);
  private quotesNumberByUser: Map<string, IUserQuotesNumber> = new Map();

  constructor(
    private readonly repo: Repository<UsersConnectionsStatistic>,
    private readonly dataSource: DataSource,
  ) {
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async saveAccumulatedQuotesNumber(): Promise<void> {
    if (this.quotesNumberByUser.size > 0) {
      const stats: Partial<UsersConnectionsStatistic>[] = [];
      Array.from(this.quotesNumberByUser.entries()).forEach(([userId, quotesNumber]) => {
        const quotesNumberFixServer = quotesNumber[UserConnectionTarget.FIX_SERVER];
        const quotesNumberWebsocketServer = quotesNumber[UserConnectionTarget.WEBSOCKET_SERVER];
        if (quotesNumberFixServer !== 0) {
          stats.push({
            userId,
            quotesNumber: quotesNumberFixServer,
            target: UserConnectionTarget.FIX_SERVER
          })
        }

        if (quotesNumberWebsocketServer !== 0) {
          stats.push({
            userId,
            quotesNumber: quotesNumberWebsocketServer,
            target: UserConnectionTarget.WEBSOCKET_SERVER
          })
        }
      });

      this.logger.debug('Reset quotes number variable');
      this.quotesNumberByUser.clear();

      await this.repo.save(stats);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async deleteOldUsersConnectionsStatistic() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setHours(oneWeekAgo.getHours() - 24 * 7);

    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(UsersConnectionsStatistic)
      .where('created_at <= :oneWeekAgo', { oneWeekAgo })
      .execute();

    this.logger.debug(`Removed ${result.affected} expired records from users_connections_statistic table.`);
  }

  public incrementQuotesNumber(userId: string, target: UserConnectionTarget, n = 1): void {
    const currentNumber = this.quotesNumberByUser.get(userId) || {
      [UserConnectionTarget.FIX_SERVER]: 0,
      [UserConnectionTarget.WEBSOCKET_SERVER]: 0,
    };

    currentNumber[target] += n;
    this.quotesNumberByUser.set(userId, currentNumber);
  }

  async getTimeline(startTime?: Date, endTime?: Date, timezone: string = 'UTC'): Promise<UsersConnectionsStatisticDto[]> {
    if (!startTime) {
      startTime = await this.getOldestStatsDate();
    }

    if (!endTime) {
      endTime = new Date();
    }

    let startMoment = moment(startTime);
    let endMoment = moment(endTime);

    const interval = this.determineInterval(startMoment, endMoment);
    const formatTimeFunction = this.getFormatTimeFunction(interval, timezone);

    const startTimeIntervalBegin = startMoment.clone().tz(timezone).startOf(interval as moment.unitOfTime.StartOf);
    const endTimeIntervalBegin = endMoment.clone().tz(timezone).startOf(interval as moment.unitOfTime.StartOf);

    return this.dataSource.query(`
      with 
        time_series as (select generate_series($1, $2, '1 ${interval}'::interval) as time),
        users as (select distinct users_connections_statistic.user_id as "userId" from users_connections_statistic),
        targets as (select distinct users_connections_statistic.target from users_connections_statistic)
      select
        ${formatTimeFunction} as time,
        u."userId",
        t.target,
        coalesce(sum(ucs.quotes_number)::int, 0) as records,
        ts.time as "startTime",
        ts.time + interval '1 ${interval}' as "endTime"
      from time_series ts
        cross join users u
        cross join targets t 
        left join users_connections_statistic ucs on date_trunc('${interval}', ucs.created_at, $5) = ts.time
        and ucs.user_id = u."userId"
        and ucs.target = t.target                                                         
        and ucs.created_at between $3 and $4
      group by ts.time,
        u."userId", t.target
      order by ts.time,
        u."userId", t.target;
    `, [
      startTimeIntervalBegin.toDate(),
      endTimeIntervalBegin.toDate(),
      startMoment.toDate(),
      endMoment.toDate(),
      timezone,
    ]);
  }

  private async getOldestStatsDate(): Promise<Date> {
    const oldestStat = await this.repo.createQueryBuilder('users_connections_statistic')
      .select('MIN(users_connections_statistic.createdAt)', 'min')
      .getRawOne();
    return new Date(oldestStat.min);
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

  private getFormatTimeFunction(interval: TInterval, timezone: string): string {
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
