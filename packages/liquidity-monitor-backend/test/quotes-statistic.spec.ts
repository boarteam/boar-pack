// The app loads moment-timezone transitively (users-backend imports it); the
// service relies on the moment.fn.tz() patch it installs.
import 'moment-timezone';
import { Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuotesStatistic } from '../src/quotes-statistic/entities/quotes-statistic.entity';
import { QuotesStatisticService } from '../src/quotes-statistic/quotes-statistic.service';
import { createTestDataSource } from './pg';

describe('QuotesStatisticService (Postgres)', () => {
  let ds: DataSource;
  let repo: Repository<QuotesStatistic>;
  let service: QuotesStatisticService;

  beforeAll(async () => {
    Logger.overrideLogger(false);
    ds = await createTestDataSource([QuotesStatistic]);
    repo = ds.getRepository(QuotesStatistic);
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  beforeEach(async () => {
    await repo.clear();
    // fresh instance so in-memory buffers never leak between tests
    service = new QuotesStatisticService(repo, ds);
  });

  const flush = () => (service as any).saveAccumulatedQuotesNumber();

  async function insertStat(provider: string, quotesNumber: number, createdAt: string) {
    await ds.query(
      `insert into quotes_statistic (quotes_provider_name, quotes_number, created_at, updated_at)
       values ($1, $2, $3, $3)`,
      [provider, quotesNumber, createdAt],
    );
  }

  it('accumulates increments in memory and writes them once on flush', async () => {
    service.incrementQuotesNumber('alpha', 3);
    service.incrementQuotesNumber('alpha'); // default n = 1
    service.incrementQuotesNumber('beta', 2);

    // nothing reaches the DB until the cron method runs
    expect(await repo.count()).toBe(0);

    await flush();

    const rows = await repo.find({ order: { quotesProviderName: 'ASC' } });
    expect(
      rows.map((r) => ({ provider: r.quotesProviderName, n: r.quotesNumber })),
    ).toEqual([
      { provider: 'alpha', n: 4 },
      { provider: 'beta', n: 2 },
    ]);

    // buffer was cleared: a second flush writes no duplicate rows
    await flush();
    expect(await repo.count()).toBe(2);
  });

  it('getLatestQuotesByProvider returns the newest record date per requested provider', async () => {
    await insertStat('alpha', 1, '2026-07-20T10:00:00.000Z');
    await insertStat('alpha', 1, '2026-07-20T12:30:00.000Z');
    await insertStat('beta', 1, '2026-07-19T08:00:00.000Z');
    await insertStat('gamma', 1, '2026-07-21T00:00:00.000Z');

    const latest = await service.getLatestQuotesByProvider(['alpha', 'beta']);

    expect(latest.size).toBe(2);
    expect(latest.get('alpha')?.toISOString()).toBe('2026-07-20T12:30:00.000Z');
    expect(latest.get('beta')?.toISOString()).toBe('2026-07-19T08:00:00.000Z');
    // gamma was not requested
    expect(latest.has('gamma')).toBe(false);
  });

  it('getTimeline buckets by second for short ranges, zero-filling every provider', async () => {
    const start = new Date('2026-07-20T10:00:00.000Z');
    const end = new Date('2026-07-20T10:00:30.000Z'); // 30s -> 'second' buckets

    await insertStat('alpha', 3, '2026-07-20T10:00:05.000Z');
    await insertStat('alpha', 2, '2026-07-20T10:00:05.700Z'); // same second bucket
    await insertStat('beta', 7, '2026-07-20T10:00:10.250Z');
    await insertStat('beta', 1, '2026-07-20T10:00:30.000Z'); // exactly endTime: included (between is inclusive)
    await insertStat('alpha', 9, '2026-07-20T10:00:30.500Z'); // bucket exists in series but createdAt > endTime: excluded

    const rows = await service.getTimeline(start, end, 'UTC');

    // 31 one-second ticks (inclusive) x 2 distinct providers
    expect(rows).toHaveLength(62);

    const cell = (time: string, provider: string) =>
      rows.find((r) => r.time === time && r.providerName === provider)!;

    expect(cell('10:00:05', 'alpha').records).toBe(5);
    expect(cell('10:00:10', 'beta').records).toBe(7);
    expect(cell('10:00:10', 'alpha').records).toBe(0);
    expect(cell('10:00:30', 'beta').records).toBe(1);
    expect(cell('10:00:30', 'alpha').records).toBe(0);

    // no counts leaked into other buckets
    const total = rows.reduce((sum, r) => sum + r.records, 0);
    expect(total).toBe(13);

    // bucket boundaries are reported as [startTime, startTime + 1 interval)
    const bucket = cell('10:00:05', 'alpha');
    expect(new Date(bucket.startTime).getTime()).toBe(Date.parse('2026-07-20T10:00:05.000Z'));
    expect(new Date(bucket.endTime).getTime()).toBe(Date.parse('2026-07-20T10:00:06.000Z'));
  });

  it('switches from second to minute buckets past a 75-second range and lists providers table-wide', async () => {
    // the providers CTE scans the whole table, so a row far outside the queried
    // range still produces zero-filled buckets for its provider
    await insertStat('p1', 3, '2026-07-20T09:00:00.000Z');

    const start = new Date('2026-07-20T10:00:00.000Z');

    // exactly 75s -> still 'second': 76 ticks, HH24:MI:SS labels
    const secondRows = await service.getTimeline(start, new Date('2026-07-20T10:01:15.000Z'), 'UTC');
    expect(secondRows).toHaveLength(76);
    expect(secondRows[0].time).toBe('10:00:00');
    expect(secondRows.every((r) => r.records === 0)).toBe(true);

    // 76s -> 'minute': 2 ticks, HH24:MI labels
    const minuteRows = await service.getTimeline(start, new Date('2026-07-20T10:01:16.000Z'), 'UTC');
    expect(minuteRows.map((r) => r.time)).toEqual(['10:00', '10:01']);
    expect(minuteRows.every((r) => r.records === 0)).toBe(true);
  });

  it('getTimeline aligns hour buckets to the requested timezone', async () => {
    // Asia/Kolkata is UTC+05:30, so its hour boundaries fall on :30 UTC
    const start = new Date('2026-07-20T10:15:00.000Z');
    const end = new Date('2026-07-20T14:15:00.000Z'); // 4h -> 'hour' buckets

    await insertStat('p1', 7, '2026-07-20T10:20:00.000Z'); // 15:50 IST -> 15:00 IST bucket
    await insertStat('p1', 2, '2026-07-20T10:35:00.000Z'); // 16:05 IST -> 16:00 IST bucket
    await insertStat('p1', 3, '2026-07-20T11:20:00.000Z'); // 16:50 IST -> 16:00 IST bucket

    const rows = await service.getTimeline(start, end, 'Asia/Kolkata');

    // series runs from startOf(hour) in IST (09:30Z) to 13:30Z, one provider
    expect(rows.map((r) => r.time)).toEqual(['15:00', '16:00', '17:00', '18:00', '19:00']);
    expect(rows.map((r) => r.records)).toEqual([7, 5, 0, 0, 0]);
    expect(rows.map((r) => new Date(r.startTime).toISOString())).toEqual([
      '2026-07-20T09:30:00.000Z',
      '2026-07-20T10:30:00.000Z',
      '2026-07-20T11:30:00.000Z',
      '2026-07-20T12:30:00.000Z',
      '2026-07-20T13:30:00.000Z',
    ]);
    expect(new Date(rows[0].endTime).toISOString()).toBe('2026-07-20T10:30:00.000Z');
  });

  it('getTimeline returns no rows when the table is empty', async () => {
    const rows = await service.getTimeline(
      new Date('2026-07-20T10:00:00.000Z'),
      new Date('2026-07-20T10:00:30.000Z'),
    );
    expect(rows).toEqual([]);
  });

  it('midnight purge deletes rows older than 7 days and keeps newer ones', async () => {
    const day = 24 * 3600 * 1000;
    await insertStat('old', 1, new Date(Date.now() - 8 * day).toISOString());
    await insertStat('edge', 1, new Date(Date.now() - 7 * day - 5 * 60 * 1000).toISOString());
    await insertStat('fresh', 1, new Date(Date.now() - 6 * day).toISOString());
    await insertStat('now', 1, new Date().toISOString());

    await (service as any).deleteOldQuotesStatistic();

    const remaining = await repo.find({ order: { quotesProviderName: 'ASC' } });
    expect(remaining.map((r) => r.quotesProviderName)).toEqual(['fresh', 'now']);
  });
});
