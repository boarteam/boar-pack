import { DataSource } from 'typeorm';
import { ApiStatisticService } from '../src/api-statistic/api-statistic.service';
import { ApiStatistic } from '../src/api-statistic/entities/api-statistic.entity';
import { SERVICES } from '../src/api-statistic/api-statistic.constants';
import { createTestDataSource } from './pg';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RangeRow = {
  serviceName: string;
  lo: Date | null;
  hi: Date | null;
  open: boolean;
};

function selectRanges(ds: DataSource): Promise<RangeRow[]> {
  return ds.query(`
    SELECT "serviceName",
           lower(uptime_period) AS lo,
           upper(uptime_period) AS hi,
           upper_inf(uptime_period) AS open
    FROM api_statistic
  `);
}

describe('ApiStatisticService (Postgres)', () => {
  let ds: DataSource;

  beforeAll(async () => {
    ds = await createTestDataSource([ApiStatistic]);
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  beforeEach(async () => {
    await ds.getRepository(ApiStatistic).clear();
  });

  describe('constructed with a service name', () => {
    it('onModuleInit inserts a row with an open (unbounded upper) uptime range', async () => {
      const before = Date.now();
      const service = new ApiStatisticService(ds.getRepository(ApiStatistic), 'my-api');
      await service.onModuleInit();

      const rows = await selectRanges(ds);
      expect(rows).toHaveLength(1);
      // Note: the constructor-provided service name only enables the service;
      // the inserted row is always labeled SERVICES.TID_API (current behavior).
      expect(rows[0].serviceName).toBe(SERVICES.TID_API);
      expect(rows[0].open).toBe(true);
      expect(rows[0].hi).toBeNull();

      const lower = new Date(rows[0].lo as Date).getTime();
      expect(lower).toBeGreaterThanOrEqual(before - 1000);
      expect(lower).toBeLessThanOrEqual(Date.now() + 1000);
    });

    it('the heartbeat refreshes the upper bound and moves it forward on each call', async () => {
      const service = new ApiStatisticService(ds.getRepository(ApiStatistic), 'my-api');
      await service.onModuleInit();

      await service.updateUptimeStatistic();
      const [first] = await selectRanges(ds);
      expect(first.open).toBe(false);
      expect(first.hi).not.toBeNull();

      await sleep(25);
      await service.updateUptimeStatistic();
      const [second] = await selectRanges(ds);
      expect(second.open).toBe(false);
      expect(new Date(second.hi as Date).getTime())
        .toBeGreaterThan(new Date(first.hi as Date).getTime());
      // lower bound stays where init put it
      expect(new Date(second.lo as Date).getTime())
        .toEqual(new Date(first.lo as Date).getTime());
    });

    it('onModuleDestroy closes the range', async () => {
      const service = new ApiStatisticService(ds.getRepository(ApiStatistic), 'my-api');
      await service.onModuleInit();
      await service.onModuleDestroy();

      const rows = await selectRanges(ds);
      expect(rows).toHaveLength(1);
      expect(rows[0].open).toBe(false);
      expect(rows[0].hi).not.toBeNull();
      const lo = new Date(rows[0].lo as Date).getTime();
      const hi = new Date(rows[0].hi as Date).getTime();
      expect(hi).toBeGreaterThanOrEqual(lo);
    });
  });

  describe('constructed without a service name', () => {
    it('is fully inert: init and destroy write no rows', async () => {
      const service = new ApiStatisticService(ds.getRepository(ApiStatistic));
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(await ds.getRepository(ApiStatistic).count()).toBe(0);
    });
  });
});
