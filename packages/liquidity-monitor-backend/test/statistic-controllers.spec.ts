// HTTP-layer test: boots the real Nest modules (controllers included) the way
// a host application does — named TypeOrm data source, CaslModule.forRoot()
// (which registers PoliciesGuard as a global APP_GUARD) and a global JoiPipe —
// then exercises the endpoints over HTTP with supertest. This covers what the
// service-level specs cannot: Joi query DTO validation (isoDate checks, the
// .single() array coercion of targetIds) and the CheckPolicies/CASL wiring.

// The controllers import the users-backend barrel, whose jwt-auth service
// requires `uuid` (v13, ESM-only) at load time — jest's CJS runtime cannot
// parse it. Substitute that exact copy with a CJS stand-in; only v4 is used.
jest.mock(
  require.resolve('uuid', {
    paths: [
      require('path').dirname(require.resolve('@boarteam/boar-pack-users-backend/package.json')),
    ],
  }),
  () => ({ v4: () => require('crypto').randomUUID() }),
);

// The app loads moment-timezone transitively (users-backend imports it); the
// services rely on the moment.fn.tz() patch it installs.
import 'moment-timezone';
import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { JoiPipe } from 'nestjs-joi';
import request from 'supertest';
import { DataSource, DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';
import { CaslModule, Roles } from '@boarteam/boar-pack-users-backend';
import { QuotesStatisticModule } from '../src/quotes-statistic';
import { QuotesStatistic } from '../src/quotes-statistic/entities/quotes-statistic.entity';
import { UsersConnectionsStatisticModule } from '../src/users-connections-statistic';
import {
  UserConnectionTarget,
  UsersConnectionsStatistic,
} from '../src/users-connections-statistic/entities/users-connections-statistic.entity';
import { createTestDatabase, testDataSourceOptions } from './pg';

// The services' raw SQL addresses user_id / target_id, but the entity leaves
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

const DS_NAME = 'liquidity_monitor_test_db';

const adminUser = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  role: Roles.ADMIN,
  permissions: [] as string[],
};
// A plain user has no permissions mapped to abilities, so every policy check
// (`ability.can(Action.Read, <entity>)`) must fail with 403.
const plainUser = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  role: Roles.USER,
  permissions: [] as string[],
};

const userA = '11111111-1111-4111-8111-111111111111';
const tokenId = '33333333-3333-4333-8333-333333333333';
const accountId = '44444444-4444-4444-8444-444444444444';

describe('Statistic controllers over HTTP (Nest app, PoliciesGuard + JoiPipe)', () => {
  let app: INestApplication;
  let ds: DataSource;
  // Swapped per test; the auth middleware below stamps it on every request the
  // way the real auth guard populates request.user before PoliciesGuard runs.
  let currentUser: typeof adminUser;

  beforeAll(async () => {
    Logger.overrideLogger(false);
    const database = await createTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...testDataSourceOptions(database, [QuotesStatistic, UsersConnectionsStatistic], {
            namingStrategy: new SnakeNamingStrategy(),
          }),
          name: DS_NAME,
          retryAttempts: 1,
        }),
        CaslModule.forRoot(),
        QuotesStatisticModule.forRoot({ dataSourceName: DS_NAME }),
        UsersConnectionsStatisticModule.forRoot({ dataSourceName: DS_NAME }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      req.user = { ...currentUser };
      next();
    });
    app.useGlobalPipes(new JoiPipe());
    await app.init();

    ds = app.get(getDataSourceToken(DS_NAME));
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    currentUser = adminUser;
  });

  const http = () => request(app.getHttpServer());

  async function insertQuoteStat(providerName: string, quotesNumber: number, createdAt: string) {
    await ds.query(
      `insert into quotes_statistic (quotes_provider_name, quotes_number, created_at)
       values ($1, $2, $3)`,
      [providerName, quotesNumber, createdAt],
    );
  }

  async function insertConnectionStat(row: {
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

  describe('GET /quotes-statistic/timeline', () => {
    beforeEach(async () => {
      await ds.query('delete from quotes_statistic');
    });

    it('returns aggregated buckets for an admin with valid ISO query params', async () => {
      await insertQuoteStat('alpha', 3, '2026-07-20T08:00:05.000Z');
      await insertQuoteStat('alpha', 2, '2026-07-20T08:00:05.600Z'); // same second bucket
      await insertQuoteStat('beta', 4, '2026-07-20T08:00:10.000Z');

      const res = await http()
        .get('/quotes-statistic/timeline')
        .query({
          startTime: '2026-07-20T08:00:00.000Z',
          endTime: '2026-07-20T08:00:30.000Z', // 30s window -> 'second' buckets
          timezone: 'UTC',
        })
        .expect(200);

      // 31 one-second ticks x 2 distinct providers
      expect(res.body).toHaveLength(62);

      const cell = (time: string, providerName: string) =>
        res.body.find((r: any) => r.time === time && r.providerName === providerName);

      expect(cell('08:00:05', 'alpha').records).toBe(5);
      expect(cell('08:00:10', 'beta').records).toBe(4);
      expect(cell('08:00:10', 'alpha').records).toBe(0);
      expect(res.body.reduce((sum: number, r: any) => sum + r.records, 0)).toBe(9);

      const bucket = cell('08:00:05', 'alpha');
      expect(new Date(bucket.startTime).getTime()).toBe(Date.parse('2026-07-20T08:00:05.000Z'));
      expect(new Date(bucket.endTime).getTime()).toBe(Date.parse('2026-07-20T08:00:06.000Z'));
    });

    it('rejects a non-ISO startTime with 400 from the Joi DTO', async () => {
      const res = await http()
        .get('/quotes-statistic/timeline')
        .query({ startTime: 'not-a-date' })
        .expect(400);
      expect(res.body.message).toMatch(/startTime/);
    });

    it('rejects an out-of-range ISO-looking endTime with 400', async () => {
      const res = await http()
        .get('/quotes-statistic/timeline')
        .query({ endTime: '2026-13-01T00:00:00.000Z' })
        .expect(400);
      expect(res.body.message).toMatch(/endTime/);
    });

    it('returns 403 for a user whose ability cannot read QuotesStatistic', async () => {
      currentUser = plainUser;
      await http().get('/quotes-statistic/timeline').expect(403);
    });
  });

  describe('GET /users-connections-statistic/timeline', () => {
    beforeEach(async () => {
      await ds.query('delete from users_connections_statistic');
    });

    it('returns per-user buckets for an admin', async () => {
      await insertConnectionStat({
        userId: userA,
        target: UserConnectionTarget.FIX_SERVER,
        quotesNumber: 3,
        createdAt: '2026-07-20T08:00:05.000Z',
      });
      await insertConnectionStat({
        userId: userA,
        target: UserConnectionTarget.WEBSOCKET_SERVER,
        quotesNumber: 4,
        createdAt: '2026-07-20T08:00:10.000Z',
      });

      const res = await http()
        .get('/users-connections-statistic/timeline')
        .query({
          startTime: '2026-07-20T08:00:00.000Z',
          endTime: '2026-07-20T08:00:30.000Z',
          timezone: 'UTC',
        })
        .expect(200);

      // 31 one-second ticks x 1 user x 2 distinct targets
      expect(res.body).toHaveLength(62);

      const cell = (time: string, target: UserConnectionTarget) =>
        res.body.find((r: any) => r.time === time && r.userId === userA && r.target === target);

      expect(cell('08:00:05', UserConnectionTarget.FIX_SERVER).records).toBe(3);
      expect(cell('08:00:10', UserConnectionTarget.WEBSOCKET_SERVER).records).toBe(4);
      expect(res.body.reduce((sum: number, r: any) => sum + r.records, 0)).toBe(7);
    });

    it('rejects a non-ISO startTime with 400', async () => {
      const res = await http()
        .get('/users-connections-statistic/timeline')
        .query({ startTime: '20/07/2026' })
        .expect(400);
      expect(res.body.message).toMatch(/startTime/);
    });

    it('returns 403 for a user whose ability cannot read UsersConnectionsStatistic', async () => {
      currentUser = plainUser;
      await http().get('/users-connections-statistic/timeline').expect(403);
    });
  });

  describe('GET /users-connections-statistic/targets-timeline', () => {
    beforeEach(async () => {
      await ds.query('delete from users_connections_statistic');
    });

    it('coerces a single targetIds query value into an array via Joi .single()', async () => {
      await insertConnectionStat({
        targetId: tokenId,
        target: UserConnectionTarget.TOKEN,
        quotesNumber: 5,
        createdAt: '2026-07-20T09:02:30.000Z',
      });
      await insertConnectionStat({
        targetId: tokenId,
        target: UserConnectionTarget.TOKEN,
        quotesNumber: 2,
        createdAt: '2026-07-20T09:02:45.000Z', // same minute bucket
      });
      // present in the table but not requested -> contributes only a zero-filled
      // 'account' target dimension, never its records
      await insertConnectionStat({
        targetId: accountId,
        target: UserConnectionTarget.ACCOUNT,
        quotesNumber: 100,
        createdAt: '2026-07-20T09:03:00.000Z',
      });

      const res = await http()
        .get(
          '/users-connections-statistic/targets-timeline' +
            `?targetIds=${tokenId}` +
            '&startTime=2026-07-20T09:00:00.000Z' +
            '&endTime=2026-07-20T09:10:00.000Z', // 10min -> 'minute' buckets
        )
        .expect(200);

      // 11 one-minute ticks x 1 requested targetId x 2 distinct targets:
      // the single string arrived at the service as ['<tokenId>']
      expect(res.body).toHaveLength(22);
      expect(res.body.every((r: any) => r.targetId === tokenId)).toBe(true);

      const tokenCell = res.body.find(
        (r: any) => r.time === '09:02' && r.target === UserConnectionTarget.TOKEN,
      );
      expect(tokenCell.records).toBe(7);
      expect(res.body.reduce((sum: number, r: any) => sum + r.records, 0)).toBe(7);
    });

    it('accepts repeated targetIds params as an array', async () => {
      await insertConnectionStat({
        targetId: tokenId,
        target: UserConnectionTarget.TOKEN,
        quotesNumber: 5,
        createdAt: '2026-07-20T09:02:30.000Z',
      });
      await insertConnectionStat({
        targetId: accountId,
        target: UserConnectionTarget.ACCOUNT,
        quotesNumber: 3,
        createdAt: '2026-07-20T09:09:59.000Z',
      });

      const res = await http()
        .get(
          '/users-connections-statistic/targets-timeline' +
            `?targetIds=${tokenId}&targetIds=${accountId}` +
            '&startTime=2026-07-20T09:00:00.000Z' +
            '&endTime=2026-07-20T09:10:00.000Z',
        )
        .expect(200);

      // 11 one-minute ticks x 2 requested targetIds x 2 distinct targets
      expect(res.body).toHaveLength(44);
      const ids = new Set(res.body.map((r: any) => r.targetId));
      expect(ids).toEqual(new Set([tokenId, accountId]));

      const cell = (time: string, targetId: string, target: UserConnectionTarget) =>
        res.body.find(
          (r: any) => r.time === time && r.targetId === targetId && r.target === target,
        );
      expect(cell('09:02', tokenId, UserConnectionTarget.TOKEN).records).toBe(5);
      expect(cell('09:09', accountId, UserConnectionTarget.ACCOUNT).records).toBe(3);
    });

    it('rejects a request without targetIds with 400 (Joi required)', async () => {
      const res = await http().get('/users-connections-statistic/targets-timeline').expect(400);
      expect(res.body.message).toMatch(/targetIds/);
    });

    it('rejects a non-ISO endTime with 400', async () => {
      const res = await http()
        .get('/users-connections-statistic/targets-timeline')
        .query({ targetIds: tokenId, endTime: 'yesterday' })
        .expect(400);
      expect(res.body.message).toMatch(/endTime/);
    });

    it('returns 403 for a plain user before validation runs (guard precedes pipes)', async () => {
      currentUser = plainUser;
      // no targetIds at all: if validation ran first this would be a 400
      await http().get('/users-connections-statistic/targets-timeline').expect(403);
    });
  });
});
