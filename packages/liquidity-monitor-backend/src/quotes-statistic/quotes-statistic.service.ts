import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { QuotesStatistic } from './entities/quotes-statistic.entity';
import { QuotesStatisticDto } from "./dto/quotes-statistic.dto";
import moment from "moment";

type TInterval = 'second' | 'minute' | 'hour' | 'day' | 'week';

@Injectable()
export class QuotesStatisticService {
  private readonly logger = new Logger(QuotesStatisticService.name);
  private quotesNumberByProvider: Map<string, number> = new Map();

  constructor(
    private readonly repo: Repository<QuotesStatistic>,
    private readonly dataSource: DataSource,
  ) {
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async saveAccumulatedQuotesNumber(): Promise<void> {
    if (this.quotesNumberByProvider.size > 0) {
      const stats = Array.from(this.quotesNumberByProvider.entries()).map(([quotesProviderName, quotesNumber]) => ({
        quotesProviderName,
        quotesNumber,
        upcoming: true,
      }));

      this.logger.debug('Reset quotes number variable');
      this.quotesNumberByProvider.clear();

      await this.repo.save(stats);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async deleteOldQuotesStatistic() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setHours(oneWeekAgo.getHours() - 24 * 7);

    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(QuotesStatistic)
      .where('created_at <= :oneWeekAgo', { oneWeekAgo })
      .execute();

    this.logger.debug(`Removed ${result.affected} expired records from quotes_statistic table.`);
  }

  public incrementQuotesNumber(provider: string, n = 1): void {
    const currentNumber = this.quotesNumberByProvider.get(provider) || 0;
    this.quotesNumberByProvider.set(provider, currentNumber + n);
  }

  async getTimeline(startTime?: Date, endTime?: Date, timezone: string = 'UTC', upcoming: boolean = true): Promise<QuotesStatisticDto[]> {
    if (!startTime) {
      startTime = await this.getOldestStatsDate(upcoming);
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
        providers as (select distinct quotes_statistic.quotes_provider_name as name from quotes_statistic)
      select
        ${formatTimeFunction} as time,
        p.name as "providerName",
        coalesce(sum(qs.quotes_number)::int, 0) as records,
        ts.time as "startTime",
        ts.time + interval '1 ${interval}' as "endTime"
      from time_series ts
        cross join providers p
        left join quotes_statistic qs on date_trunc('${interval}', qs.created_at, $5) = ts.time
        and qs.quotes_provider_name = p.name
        and qs.upcoming = $6                                     
        and qs.created_at between $3 and $4
      group by ts.time,
        p.name
      order by ts.time,
        p.name;
    `, [
      startTimeIntervalBegin.toDate(),
      endTimeIntervalBegin.toDate(),
      startMoment.toDate(),
      endMoment.toDate(),
      timezone,
      upcoming
    ]);
  }

  private async getOldestStatsDate(upcoming: boolean): Promise<Date> {
    const oldestStat = await this.repo.createQueryBuilder('quotes_statistic')
      .select('MIN(quotes_statistic.createdAt)', 'min')
      .where('quotes_statistic.upcoming = :upcoming', {
        upcoming,
      })
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
