import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { QuotesStatistic } from './entities/quotes-statistic.entity';
import { QuotesStatisticDto } from "./dto/quotes-statistic.dto";
import moment from "moment";
import { TProvider } from "./quotes-statistic.types";

type TLatestQuotesQueryResult = {
  quotesProviderName: string; // qs.quotes_provider_name
  latestQuoteDate: string; // max(qs.created_at)
};

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

  async getTimeline(startTime?: Date, endTime?: Date, timezone: string = 'UTC'): Promise<QuotesStatisticDto[]> {
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
    ]);
  }

  /**
   * Get the oldest date from the quotes_statistic table for a given upcoming status.
   * If no records are found, it returns a current date minus 7 days.
   * @private
   */
  private async getOldestStatsDate(): Promise<Date> {
    const oldestStat = await this.repo.createQueryBuilder('quotes_statistic')
      .select('MIN(quotes_statistic.createdAt)', 'min')
      .getRawOne();
    return oldestStat.min ? new Date(oldestStat.min) : moment().subtract(7, 'days').toDate();
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

  public async getLatestQuotesByProvider(providerIds: TProvider['id'][]): Promise<Map<QuotesStatistic['quotesProviderName'], Date>> {
    const result: TLatestQuotesQueryResult[] = await this.repo
      .createQueryBuilder('qs')
      .select('qs.quotesProviderName', 'quotesProviderName')
      .addSelect('max(qs.createdAt)', 'latestQuoteDate')
      .where('qs.quotesProviderName in (:...providerIds)', { providerIds })
      .groupBy('qs.quotesProviderName')
      .getRawMany();

    return new Map(result.map(row => [
      row.quotesProviderName,
      new Date(row.latestQuoteDate),
    ]));
  }
}
