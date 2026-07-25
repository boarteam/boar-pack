// The app loads moment-timezone transitively (users-backend imports it); the
// service relies on the moment.fn.tz() patch it installs.
import 'moment-timezone';
import { Logger } from '@nestjs/common';
import { DataSource, DefaultNamingStrategy, NamingStrategyInterface, Repository } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';
import {
  UserConnectionTarget,
  UsersConnectionsStatistic,
} from '../src/users-connections-statistic/entities/users-connections-statistic.entity';
import { UsersConnectionsStatisticService } from '../src/users-connections-statistic/users-connections-statistic.service';
import { createTestDataSource } from './pg';

// The service's raw SQL addresses user_id / target_id, but the entity leaves
// those columns unnamed — host applications must configure a snake_case
// NamingStrategy on their DataSource for the queries to work. Mirror that here.
class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return snakeCase(embeddedPrefixes.concat(customName || propertyName).join('_'));
  }
}

const userA = '11111111-1111-4111-8111-111111111111';
const userB = '22222222-2222-4222-8222-222222222222';
const tokenId = '33333333-3333-4333-8333-333333333333';
const accountId = '44444444-4444-4444-8444-444444444444';
const userC = '55555555-5555-4555-8555-555555555555';
const otherTokenId = '66666666-6666-4666-8666-666666666666';
const foreignTargetId = '77777777-7777-4777-8777-777777777777';

describe('UsersConnectionsStatisticService (Postgres)', () => {
  let ds: DataSource;
  let repo: Repository<UsersConnectionsStatistic>;
  let service: UsersConnectionsStatisticService;

  beforeAll(async () => {
    Logger.overrideLogger(false);
    ds = await createTestDataSource([UsersConnectionsStatistic], {
      namingStrategy: new SnakeNamingStrategy(),
    });
    repo = ds.getRepository(UsersConnectionsStatistic);
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  beforeEach(async () => {
    await repo.clear();
    // fresh instance so in-memory buffers never leak between tests
    service = new UsersConnectionsStatisticService(repo, ds);
  });

  const flush = () => (service as any).saveAccumulatedQuotesNumber();

  async function insertStat(row: {
    userId?: string | null;
    targetId?: string | null;
    target: UserConnectionTarget;
    quotesNumber: number;
    createdAt: string;
  }) {
    await ds.query(
      `insert into users_connections_statistic (user_id, target_id, target, quotes_number, created_at)
       values ($1, $2, $3, $4, $5)`,
      [row.userId ?? null, row.targetId ?? null, row.target, row.quotesNumber, row.createdAt],
    );
  }

  it('keeps the deprecated user_id column alongside target_id, both as nullable uuids', async () => {
    const cols: { column_name: string; data_type: string; is_nullable: string }[] = await ds.query(`
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_name = 'users_connections_statistic'
    `);
    const byName = new Map(cols.map((c) => [c.column_name, c]));

    // user_id is deprecated in favour of target_id but consumers still rely on
    // it being present until the migration completes
    expect(byName.get('user_id')).toMatchObject({ data_type: 'uuid', is_nullable: 'YES' });
    expect(byName.get('target_id')).toMatchObject({ data_type: 'uuid', is_nullable: 'YES' });
    expect(byName.get('quotes_number')).toMatchObject({ data_type: 'integer', is_nullable: 'NO' });
    expect(byName.get('created_at')).toMatchObject({ data_type: 'timestamp with time zone' });

    const labels: { enumlabel: string }[] = await ds.query(`
      select e.enumlabel
      from pg_type t
        join pg_enum e on e.enumtypid = t.oid
      where t.typname = 'users_connections_statistic_target_enum'
      order by e.enumsortorder
    `);
    expect(labels.map((l) => l.enumlabel)).toEqual([
      'fix-server',
      'websocket-server',
      'token',
      'account',
    ]);
  });

  it('buffers per-user increments and flushes one row per (user, target), skipping zero counts', async () => {
    service.incrementQuotesNumber(userA, UserConnectionTarget.FIX_SERVER, 3);
    service.incrementQuotesNumber(userA, UserConnectionTarget.FIX_SERVER); // default n = 1
    service.incrementQuotesNumber(userA, UserConnectionTarget.WEBSOCKET_SERVER, 2);
    service.incrementQuotesNumber(userB, UserConnectionTarget.WEBSOCKET_SERVER, 7);
    service.incrementQuotesNumber(userC, UserConnectionTarget.FIX_SERVER, 0); // stays 0 -> no row

    expect(await repo.count()).toBe(0);

    await flush();

    const rows = await repo.find({ order: { userId: 'ASC', target: 'ASC' } });
    expect(
      rows.map(({ userId, targetId, target, quotesNumber }) => ({
        userId,
        targetId,
        target,
        quotesNumber,
      })),
    ).toEqual([
      { userId: userA, targetId: null, target: UserConnectionTarget.FIX_SERVER, quotesNumber: 4 },
      {
        userId: userA,
        targetId: null,
        target: UserConnectionTarget.WEBSOCKET_SERVER,
        quotesNumber: 2,
      },
      {
        userId: userB,
        targetId: null,
        target: UserConnectionTarget.WEBSOCKET_SERVER,
        quotesNumber: 7,
      },
    ]);

    // buffer cleared: a second flush writes no duplicate rows
    await flush();
    expect(await repo.count()).toBe(3);
  });

  it('buffers per-target increments and flushes rows with targetId set and userId null', async () => {
    service.incrementQuotesNumberByTarget(UserConnectionTarget.TOKEN, tokenId, 5);
    service.incrementQuotesNumberByTarget(UserConnectionTarget.TOKEN, tokenId, 2);
    service.incrementQuotesNumberByTarget(UserConnectionTarget.TOKEN, otherTokenId); // default n = 1
    service.incrementQuotesNumberByTarget(UserConnectionTarget.ACCOUNT, accountId, 3);

    expect(await repo.count()).toBe(0);

    await flush();

    const rows = await repo.find();
    const simplified = rows
      .map(({ userId, targetId, target, quotesNumber }) => ({
        userId,
        targetId,
        target,
        quotesNumber,
      }))
      .sort((a, b) => a.target.localeCompare(b.target) || a.targetId!.localeCompare(b.targetId!));
    expect(simplified).toEqual([
      { userId: null, targetId: accountId, target: UserConnectionTarget.ACCOUNT, quotesNumber: 3 },
      { userId: null, targetId: tokenId, target: UserConnectionTarget.TOKEN, quotesNumber: 7 },
      { userId: null, targetId: otherTokenId, target: UserConnectionTarget.TOKEN, quotesNumber: 1 },
    ]);

    await flush();
    expect(await repo.count()).toBe(3);
  });

  it('getTimeline buckets per user and target by second, zero-filling the grid', async () => {
    const start = new Date('2026-07-20T08:00:00.000Z');
    const end = new Date('2026-07-20T08:00:30.000Z'); // 30s -> 'second' buckets

    await insertStat({
      userId: userA,
      target: UserConnectionTarget.FIX_SERVER,
      quotesNumber: 3,
      createdAt: '2026-07-20T08:00:05.000Z',
    });
    await insertStat({
      userId: userA,
      target: UserConnectionTarget.FIX_SERVER,
      quotesNumber: 2,
      createdAt: '2026-07-20T08:00:05.600Z',
    }); // same bucket
    await insertStat({
      userId: userA,
      target: UserConnectionTarget.WEBSOCKET_SERVER,
      quotesNumber: 4,
      createdAt: '2026-07-20T08:00:10.000Z',
    });
    await insertStat({
      userId: userB,
      target: UserConnectionTarget.FIX_SERVER,
      quotesNumber: 6,
      createdAt: '2026-07-20T08:00:10.000Z',
    });
    // a target-only row (user_id null) never matches a user, but its target
    // still enters the targets CTE, adding zero-filled 'token' rows to the grid
    await insertStat({
      targetId: tokenId,
      target: UserConnectionTarget.TOKEN,
      quotesNumber: 9,
      createdAt: '2026-07-20T08:00:07.000Z',
    });

    const rows = await service.getTimeline(start, end, 'UTC');

    // 31 one-second ticks x 2 users x 3 distinct targets
    expect(rows).toHaveLength(186);

    const cell = (time: string, userId: string, target: UserConnectionTarget) =>
      rows.find((r) => r.time === time && r.userId === userId && r.target === target)!;

    expect(cell('08:00:05', userA, UserConnectionTarget.FIX_SERVER).records).toBe(5);
    expect(cell('08:00:10', userA, UserConnectionTarget.WEBSOCKET_SERVER).records).toBe(4);
    expect(cell('08:00:10', userB, UserConnectionTarget.FIX_SERVER).records).toBe(6);
    expect(cell('08:00:10', userB, UserConnectionTarget.WEBSOCKET_SERVER).records).toBe(0);

    // the token row's count is not attributed to any user
    expect(
      rows.filter((r) => r.target === UserConnectionTarget.TOKEN).every((r) => r.records === 0),
    ).toBe(true);
    expect(rows.reduce((sum, r) => sum + r.records, 0)).toBe(15);

    const bucket = cell('08:00:05', userA, UserConnectionTarget.FIX_SERVER);
    expect(new Date(bucket.startTime).getTime()).toBe(Date.parse('2026-07-20T08:00:05.000Z'));
    expect(new Date(bucket.endTime).getTime()).toBe(Date.parse('2026-07-20T08:00:06.000Z'));
  });

  it('getTargetsTimeline buckets by minute for the requested targetIds only', async () => {
    const start = new Date('2026-07-20T09:00:00.000Z');
    const end = new Date('2026-07-20T09:10:00.000Z'); // 10min -> 'minute' buckets

    await insertStat({
      targetId: tokenId,
      target: UserConnectionTarget.TOKEN,
      quotesNumber: 5,
      createdAt: '2026-07-20T09:02:30.000Z',
    });
    await insertStat({
      targetId: tokenId,
      target: UserConnectionTarget.TOKEN,
      quotesNumber: 2,
      createdAt: '2026-07-20T09:02:45.000Z',
    }); // same bucket
    await insertStat({
      targetId: accountId,
      target: UserConnectionTarget.ACCOUNT,
      quotesNumber: 3,
      createdAt: '2026-07-20T09:09:59.000Z',
    });
    // present in the table but not in the requested targetIds -> never counted
    await insertStat({
      targetId: foreignTargetId,
      target: UserConnectionTarget.TOKEN,
      quotesNumber: 100,
      createdAt: '2026-07-20T09:01:00.000Z',
    });

    const rows = await service.getTargetsTimeline({
      startTime: start,
      endTime: end,
      targetIds: [tokenId, accountId],
    });

    // 11 one-minute ticks x 2 requested targetIds x 2 distinct targets
    expect(rows).toHaveLength(44);
    expect(rows.every((r) => r.targetId === tokenId || r.targetId === accountId)).toBe(true);

    const cell = (time: string, targetId: string, target: UserConnectionTarget) =>
      rows.find((r) => r.time === time && r.targetId === targetId && r.target === target)!;

    expect(cell('09:02', tokenId, UserConnectionTarget.TOKEN).records).toBe(7);
    expect(cell('09:09', accountId, UserConnectionTarget.ACCOUNT).records).toBe(3);
    expect(cell('09:02', accountId, UserConnectionTarget.TOKEN).records).toBe(0);
    // the foreign target's 100 quotes are excluded entirely
    expect(rows.reduce((sum, r) => sum + r.records, 0)).toBe(10);

    const bucket = cell('09:02', tokenId, UserConnectionTarget.TOKEN);
    expect(new Date(bucket.startTime).getTime()).toBe(Date.parse('2026-07-20T09:02:00.000Z'));
    expect(new Date(bucket.endTime).getTime()).toBe(Date.parse('2026-07-20T09:03:00.000Z'));
  });

  it('getTimeline on an empty table returns no rows', async () => {
    // With no rows getOldestUsersStatsDate() yields new Date(null) — the epoch —
    // so the implicit range spans decades of weekly buckets, but the empty
    // users CTE collapses the cross join to nothing.
    await expect(service.getTimeline()).resolves.toEqual([]);
  });

  it('midnight purge deletes rows older than 7 days and keeps newer ones', async () => {
    const day = 24 * 3600 * 1000;
    await insertStat({
      userId: userA,
      target: UserConnectionTarget.FIX_SERVER,
      quotesNumber: 1,
      createdAt: new Date(Date.now() - 8 * day).toISOString(),
    });
    await insertStat({
      targetId: tokenId,
      target: UserConnectionTarget.TOKEN,
      quotesNumber: 2,
      createdAt: new Date(Date.now() - 7 * day - 5 * 60 * 1000).toISOString(),
    });
    await insertStat({
      userId: userB,
      target: UserConnectionTarget.WEBSOCKET_SERVER,
      quotesNumber: 3,
      createdAt: new Date(Date.now() - 6 * day).toISOString(),
    });

    await (service as any).deleteOldUsersConnectionsStatistic();

    const remaining = await repo.find();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].userId).toBe(userB);
    expect(remaining[0].quotesNumber).toBe(3);
  });
});
