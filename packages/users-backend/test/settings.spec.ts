import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SettingsModule } from '../src/settings/settings.module';
import { SettingsService } from '../src/settings/settings.service';
import { Setting } from '../src/settings/entities/setting.entity';
import { Notifications, SettingsValues } from '../src/settings/settings.constants';
import { createTestDatabase, testDataSourceOptions } from './pg';

const DATA_SOURCE_NAME = 'settings-db';

describe('SettingsService (SettingsModule.register)', () => {
  let moduleRef: TestingModule;
  let service: SettingsService;
  let repo: Repository<Setting>;

  beforeAll(async () => {
    const db = await createTestDatabase();
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...testDataSourceOptions(db, [Setting]),
          name: DATA_SOURCE_NAME,
        }),
        SettingsModule.register({
          withControllers: false,
          dataSourceName: DATA_SOURCE_NAME,
        }),
      ],
    }).compile();
    await moduleRef.init();

    service = moduleRef.get(SettingsService);
    const dataSource = moduleRef.get<DataSource>(getDataSourceToken(DATA_SOURCE_NAME));
    repo = dataSource.getRepository(Setting);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  describe('getSettings', () => {
    it('returns an empty list when nothing is stored', async () => {
      await expect(service.getSettings(['telegram.enabled'])).resolves.toEqual([]);
    });

    it('returns only the requested keys', async () => {
      await repo.save([
        { key: 'telegram.enabled', value: SettingsValues.YES },
        { key: 'telegram.chat_id', value: '42' },
        { key: 'other.key', value: 'other' },
      ]);

      const settings = await service.getSettings(['telegram.enabled', 'telegram.chat_id']);

      expect(settings).toHaveLength(2);
      expect(settings.map((s) => [s.key, s.value]).sort()).toEqual([
        ['telegram.chat_id', '42'],
        ['telegram.enabled', SettingsValues.YES],
      ]);
    });
  });

  describe('updateSettings', () => {
    it('inserts new settings rows', async () => {
      await service.updateSettings([
        { key: 'a.one', value: '1' },
        { key: 'a.two', value: '2' },
      ]);

      const rows = await repo.find({ order: { key: 'ASC' } });
      expect(rows.map((r) => [r.key, r.value])).toEqual([
        ['a.one', '1'],
        ['a.two', '2'],
      ]);
    });

    it('upserts by key: updates value in place without creating a duplicate row', async () => {
      await service.updateSettings([{ key: 'a.one', value: 'old' }]);
      const [before] = await repo.findBy({ key: 'a.one' });

      await service.updateSettings([{ key: 'a.one', value: 'new' }]);

      const rows = await repo.findBy({ key: 'a.one' });
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe(before.id);
      expect(rows[0].value).toBe('new');
    });

    it('is a no-op for an empty settings list', async () => {
      await repo.save([{ key: 'a.one', value: '1' }]);

      await expect(service.updateSettings([])).resolves.toBeUndefined();

      await expect(repo.count()).resolves.toBe(1);
    });
  });

  describe('getEventSettings', () => {
    it('maps only notifications.* keys, converting "yes" to true and anything else to false', async () => {
      await repo.save([
        { key: Notifications.QuotesByProviderStatus, value: SettingsValues.YES },
        { key: Notifications.QuotesByUserStatus, value: SettingsValues.NO },
        // Not a notifications.* key — must not leak into event settings
        { key: 'telegram.enabled', value: SettingsValues.YES },
      ]);

      const eventSettings = await service.getEventSettings();

      expect(eventSettings).toEqual({
        [Notifications.QuotesByProviderStatus]: true,
        [Notifications.QuotesByUserStatus]: false,
      });
    });

    it('returns an empty dto when no notification settings are stored', async () => {
      await expect(service.getEventSettings()).resolves.toEqual({});
    });
  });

  describe('setEventSettings', () => {
    it('stores booleans as yes/no values', async () => {
      await service.setEventSettings({
        [Notifications.QuotesByProviderStatus]: true,
        [Notifications.QuotesByUserStatus]: false,
      });

      const rows = await repo.find({ order: { key: 'ASC' } });
      expect(rows.map((r) => [r.key, r.value])).toEqual([
        [Notifications.QuotesByProviderStatus, SettingsValues.YES],
        [Notifications.QuotesByUserStatus, SettingsValues.NO],
      ]);
    });

    it('round-trips through getEventSettings and toggles existing keys', async () => {
      await service.setEventSettings({ [Notifications.QuotesByProviderStatus]: true });
      await expect(service.getEventSettings()).resolves.toEqual({
        [Notifications.QuotesByProviderStatus]: true,
      });

      await service.setEventSettings({ [Notifications.QuotesByProviderStatus]: false });
      await expect(service.getEventSettings()).resolves.toEqual({
        [Notifications.QuotesByProviderStatus]: false,
      });

      // Toggling must not duplicate the row
      await expect(repo.countBy({ key: Notifications.QuotesByProviderStatus })).resolves.toBe(1);
    });
  });
});
