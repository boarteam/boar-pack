import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';

// The users-backend barrel transitively requires ESM-only packages (uuid) that
// jest cannot load, so mock it: real settings enums (required from the exact
// source file to avoid drift) plus stubs for what the import graph touches at
// module-load time (the quotes-statistic controller applies CheckPolicies while
// being decorated).
jest.mock('@boarteam/boar-pack-users-backend', () => ({
  ...jest.requireActual('@boarteam/boar-pack-users-backend/src/settings/settings.constants'),
  CheckPolicies: () => () => undefined,
  Action: {},
  TelegrafService: class TelegrafService {},
  SettingsService: class SettingsService {},
}));

import { Notifications, SettingsValues } from '@boarteam/boar-pack-users-backend';
import { ProviderMonitoringService } from '../src/provider-monitoring/provider-monitoring.service';
import { ProvidersProblematicPeriod } from '../src/provider-monitoring/entities/providers-problematic-period.entity';
import type { TProvider } from '../src/quotes-statistic';
import { createTestDataSource } from './pg';

type PeriodRow = {
  provider_id: string;
  lo: Date | null;
  hi: Date | null;
  open: boolean;
};

describe('ProviderMonitoringService (Postgres)', () => {
  let ds: DataSource;
  let telegraf: { sendMessage: jest.Mock };
  let settings: { getSettings: jest.Mock };
  let quotes: { getLatestQuotesByProvider: jest.Mock };
  let fetchProviders: jest.Mock;
  let service: ProviderMonitoringService;
  const savedSwagger = process.env.SWAGGER;

  function makeService(): ProviderMonitoringService {
    return new ProviderMonitoringService(
      ds,
      telegraf as any,
      settings as any,
      quotes as any,
      fetchProviders,
    );
  }

  function selectPeriods(): Promise<PeriodRow[]> {
    return ds.query(`
      SELECT provider_id,
             lower(period) AS lo,
             upper(period) AS hi,
             upper_inf(period) AS open
      FROM providers_problematic_period
    `);
  }

  function checkActivity(): Promise<void> {
    return (service as any).checkProviderActivity();
  }

  function sentTexts(): string[] {
    return telegraf.sendMessage.mock.calls.map(([message]) => message.text);
  }

  beforeAll(async () => {
    ds = await createTestDataSource([ProvidersProblematicPeriod]);
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  beforeEach(async () => {
    await ds.getRepository(ProvidersProblematicPeriod).clear();
    telegraf = { sendMessage: jest.fn().mockResolvedValue(undefined) };
    settings = {
      getSettings: jest.fn().mockResolvedValue([{ value: SettingsValues.YES }]),
    };
    quotes = { getLatestQuotesByProvider: jest.fn().mockResolvedValue(new Map()) };
    fetchProviders = jest.fn().mockResolvedValue([]);
    service = makeService();
  });

  afterEach(() => {
    // Never leave the real 10s interval running.
    service.stopMonitoring();
    jest.restoreAllMocks();
    if (savedSwagger === undefined) {
      delete process.env.SWAGGER;
    } else {
      process.env.SWAGGER = savedSwagger;
    }
  });

  it('opens problematic periods and sends warnings for stale providers; skips providers without a threshold', async () => {
    const stale: TProvider = { id: randomUUID(), name: 'StaleProvider', threshold: 30 };
    const silent: TProvider = { id: randomUUID(), name: 'SilentProvider', threshold: 10 };
    const noThreshold: TProvider = { id: randomUUID(), name: 'NoThreshold', threshold: null };
    fetchProviders.mockResolvedValue([stale, silent, noThreshold]);
    // stale has a quote older than its threshold; silent has no quotes at all
    quotes.getLatestQuotesByProvider.mockResolvedValue(
      new Map([[stale.id, new Date(Date.now() - 60_000)]]),
    );

    await checkActivity();

    expect(quotes.getLatestQuotesByProvider).toHaveBeenCalledWith([stale.id, silent.id]);

    const rows = await selectPeriods();
    expect(rows).toHaveLength(2);
    const byId = new Map(rows.map((row) => [row.provider_id, row]));
    for (const provider of [stale, silent]) {
      const row = byId.get(provider.id);
      expect(row).toBeDefined();
      expect(row!.lo).not.toBeNull();
      expect(row!.hi).toBeNull();
      expect(row!.open).toBe(true);
    }
    expect(byId.has(noThreshold.id)).toBe(false);

    expect(telegraf.sendMessage).toHaveBeenCalledTimes(2);
    for (const [, type] of telegraf.sendMessage.mock.calls) {
      expect(type).toBe(Notifications.QuotesByProviderStatus);
    }
    const texts = sentTexts();
    expect(texts.some((t) => t.includes('StaleProvider') && t.includes('has no quotes'))).toBe(
      true,
    );
    expect(texts.some((t) => t.includes('SilentProvider') && t.includes('has no quotes'))).toBe(
      true,
    );
  });

  it('does nothing when no provider has a threshold', async () => {
    fetchProviders.mockResolvedValue([{ id: randomUUID(), name: 'NoThreshold', threshold: null }]);

    await checkActivity();

    expect(quotes.getLatestQuotesByProvider).not.toHaveBeenCalled();
    expect(telegraf.sendMessage).not.toHaveBeenCalled();
    expect(await selectPeriods()).toHaveLength(0);
  });

  it('repeated checks on a still-stale provider follow the exponential backoff schedule', async () => {
    const provider: TProvider = { id: randomUUID(), name: 'StaleProvider', threshold: 30 };
    fetchProviders.mockResolvedValue([provider]);
    const base = Date.now();
    quotes.getLatestQuotesByProvider.mockResolvedValue(
      new Map([[provider.id, new Date(base - 60_000)]]),
    );

    let nowMs = base;
    jest.spyOn(Date, 'now').mockImplementation(() => nowMs);

    const runAt = async (offsetSeconds: number) => {
      nowMs = base + offsetSeconds * 1000;
      await checkActivity();
      return telegraf.sendMessage.mock.calls.length;
    };

    expect(await runAt(0)).toBe(1); // first warning, journal starts at 0 attempts
    expect(await runAt(100)).toBe(1); // 100s < 299s -> muted
    expect(await runAt(299)).toBe(2); // backoff[0] elapsed
    expect(await runAt(299 + 598)).toBe(2); // 598s < 599s -> muted
    expect(await runAt(299 + 599)).toBe(3); // backoff[1] elapsed
    expect(await runAt(898 + 1798)).toBe(3); // 1798s < 1799s -> muted
    expect(await runAt(898 + 1799)).toBe(4); // backoff[2] elapsed
    expect(await runAt(2697 + 3599)).toBe(5); // backoff[3] elapsed
    // After the schedule is exhausted the provider is muted until it recovers.
    expect(await runAt(6296 + 1_000_000)).toBe(5);

    // The whole time only one problematic period existed, and it is still open.
    const rows = await selectPeriods();
    expect(rows).toHaveLength(1);
    expect(rows[0].provider_id).toBe(provider.id);
    expect(rows[0].open).toBe(true);
  });

  it('closes the period and sends "active again" when the provider recovers', async () => {
    const provider: TProvider = { id: randomUUID(), name: 'FlakyProvider', threshold: 30 };
    fetchProviders.mockResolvedValue([provider]);
    quotes.getLatestQuotesByProvider.mockResolvedValue(
      new Map([[provider.id, new Date(Date.now() - 60_000)]]),
    );

    await checkActivity();
    expect(telegraf.sendMessage).toHaveBeenCalledTimes(1);
    expect((await selectPeriods())[0].open).toBe(true);

    // Fresh quote -> recovered
    quotes.getLatestQuotesByProvider.mockResolvedValue(new Map([[provider.id, new Date()]]));
    await checkActivity();

    const rows = await selectPeriods();
    expect(rows).toHaveLength(1);
    expect(rows[0].provider_id).toBe(provider.id);
    expect(rows[0].open).toBe(false);
    expect(rows[0].hi).not.toBeNull();
    expect(new Date(rows[0].hi as Date).getTime()).toBeGreaterThanOrEqual(
      new Date(rows[0].lo as Date).getTime(),
    );

    expect(telegraf.sendMessage).toHaveBeenCalledTimes(2);
    const [message, type] = telegraf.sendMessage.mock.calls[1];
    expect(message.text).toContain('FlakyProvider');
    expect(message.text).toContain('is active again');
    expect(type).toBe(Notifications.QuotesByProviderStatus);

    // Journal was reset: going stale again warns immediately (no leftover backoff)
    quotes.getLatestQuotesByProvider.mockResolvedValue(
      new Map([[provider.id, new Date(Date.now() - 60_000)]]),
    );
    await checkActivity();
    expect(telegraf.sendMessage).toHaveBeenCalledTimes(3);
    expect(sentTexts()[2]).toContain('has no quotes');
  });

  it('still records problematic periods but sends no messages when notifications are disabled', async () => {
    settings.getSettings.mockResolvedValue([{ value: SettingsValues.NO }]);
    const provider: TProvider = { id: randomUUID(), name: 'StaleProvider', threshold: 30 };
    fetchProviders.mockResolvedValue([provider]);
    quotes.getLatestQuotesByProvider.mockResolvedValue(
      new Map([[provider.id, new Date(Date.now() - 60_000)]]),
    );

    await checkActivity();

    // Period tracking is independent of the telegram notification setting.
    const rows = await selectPeriods();
    expect(rows).toHaveLength(1);
    expect(rows[0].open).toBe(true);
    expect(telegraf.sendMessage).not.toHaveBeenCalled();
  });

  it('onModuleInit does not start monitoring when the setting is disabled', async () => {
    settings.getSettings.mockResolvedValue([{ value: SettingsValues.NO }]);
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    await service.onModuleInit();

    expect(settings.getSettings).toHaveBeenCalledWith([Notifications.QuotesByProviderStatus]);
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(fetchProviders).not.toHaveBeenCalled();
  });

  it('onModuleInit schedules the 10s check when enabled and onModuleDestroy clears it', async () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    await service.onModuleInit();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

    const handle = setIntervalSpy.mock.results[0].value;
    service.onModuleDestroy();
    expect(clearIntervalSpy).toHaveBeenCalledWith(handle);

    // The interval never fired within the test
    expect(fetchProviders).not.toHaveBeenCalled();
  });

  it("SWAGGER='true' skips both onModuleInit and onModuleDestroy work", async () => {
    process.env.SWAGGER = 'true';
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const stopSpy = jest.spyOn(service, 'stopMonitoring');

    await service.onModuleInit();
    expect(settings.getSettings).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();

    service.onModuleDestroy();
    expect(stopSpy).not.toHaveBeenCalled();
  });
});
