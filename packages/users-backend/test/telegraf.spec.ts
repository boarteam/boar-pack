import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TelegrafModule } from '../src/telegraf/telegraf.module';
import { TelegrafService } from '../src/telegraf/telegraf.service';
import { Telegram } from '../src/telegraf/telegraf.constants';
import { Setting } from '../src/settings/entities/setting.entity';
import { Notifications, SettingsValues } from '../src/settings/settings.constants';
import { createTestDatabase, testDataSourceOptions } from './pg';

jest.mock('telegraf', () => {
  const sendMessage = jest.fn();
  return {
    Telegraf: jest.fn(() => ({ telegram: { sendMessage } })),
    // Exposed for assertions via jest.requireMock — all bot instances share it.
    __sendMessage: sendMessage,
  };
});

const telegrafMock = jest.requireMock('telegraf') as {
  Telegraf: jest.Mock;
  __sendMessage: jest.Mock;
};

describe('TelegrafService (TelegrafModule.register)', () => {
  let moduleRef: TestingModule;
  let service: TelegrafService;
  let repo: Repository<Setting>;

  beforeAll(async () => {
    const db = await createTestDatabase();
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDataSourceOptions(db, [Setting])),
        TelegrafModule.register({
          withControllers: false,
          dataSourceName: 'default',
        }),
      ],
    }).compile();
    await moduleRef.init();

    service = moduleRef.get(TelegrafService);
    const dataSource = moduleRef.get<DataSource>(getDataSourceToken());
    repo = dataSource.getRepository(Setting);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await repo.clear();
    telegrafMock.Telegraf.mockClear();
    telegrafMock.__sendMessage.mockClear();
    telegrafMock.__sendMessage.mockResolvedValue(undefined);
  });

  async function seedEnabledSettings(overrides: Partial<Record<string, string>> = {}) {
    const values: Record<string, string> = {
      [Telegram.Enabled]: SettingsValues.YES,
      [Telegram.BotToken]: '12345:test-bot-token',
      [Telegram.ChatId]: '-1004242',
      ...overrides,
    };
    await repo.save(Object.entries(values).map(([key, value]) => ({ key, value })));
  }

  describe('getTelegramSettings', () => {
    it('returns disabled defaults when nothing is stored', async () => {
      await expect(service.getTelegramSettings()).resolves.toEqual({
        enabled: false,
        botToken: '',
        chatId: '',
      });
    });

    it('maps stored settings rows to the dto', async () => {
      await seedEnabledSettings();

      await expect(service.getTelegramSettings()).resolves.toEqual({
        enabled: true,
        botToken: '12345:test-bot-token',
        chatId: '-1004242',
      });
    });

    it('treats any non-"yes" enabled value as disabled', async () => {
      await seedEnabledSettings({ [Telegram.Enabled]: SettingsValues.NO });

      const settings = await service.getTelegramSettings();
      expect(settings.enabled).toBe(false);
    });
  });

  describe('setTelegramSettings', () => {
    it('persists enabled flag, bot token and chat id', async () => {
      await service.setTelegramSettings({
        enabled: true,
        botToken: '999:tok',
        chatId: '77',
      });

      const rows = await repo.find({ order: { key: 'ASC' } });
      expect(rows.map((r) => [r.key, r.value])).toEqual([
        [Telegram.BotToken, '999:tok'],
        [Telegram.ChatId, '77'],
        [Telegram.Enabled, SettingsValues.YES],
      ]);
    });

    it('updates existing values without duplicating rows', async () => {
      await service.setTelegramSettings({ enabled: true, botToken: 'old', chatId: '1' });
      await service.setTelegramSettings({ botToken: 'new' });

      const rows = await repo.findBy({ key: Telegram.BotToken });
      expect(rows).toHaveLength(1);
      expect(rows[0].value).toBe('new');
    });

    it('cannot disable notifications: enabled=false is silently dropped', async () => {
      // Current behavior (looks like a bug): `if (updateDto.enabled)` skips falsy
      // values, so { enabled: false } writes nothing and telegram stays enabled.
      await service.setTelegramSettings({ enabled: true, botToken: 't', chatId: 'c' });

      await service.setTelegramSettings({ enabled: false });

      const enabledRow = await repo.findOneByOrFail({ key: Telegram.Enabled });
      expect(enabledRow.value).toBe(SettingsValues.YES);
      await expect(service.getTelegramSettings()).resolves.toMatchObject({ enabled: true });
    });

    it('ignores empty-string token and chat id (no rows written)', async () => {
      await service.setTelegramSettings({ botToken: '', chatId: '' });

      await expect(repo.count()).resolves.toBe(0);
    });
  });

  describe('sendMessage', () => {
    it('creates a bot with the configured token and sends to the configured chat', async () => {
      await seedEnabledSettings();

      await service.sendMessage('hello there', Notifications.QuotesByProviderStatus);

      expect(telegrafMock.Telegraf).toHaveBeenCalledTimes(1);
      expect(telegrafMock.Telegraf).toHaveBeenCalledWith('12345:test-bot-token');
      expect(telegrafMock.__sendMessage).toHaveBeenCalledTimes(1);
      expect(telegrafMock.__sendMessage).toHaveBeenCalledWith('-1004242', 'hello there');
    });

    it('routes every notification type (and null) to the single configured chat', async () => {
      await seedEnabledSettings();

      await service.sendMessage('a', Notifications.QuotesByProviderStatus);
      await service.sendMessage('b', Notifications.QuotesByUserStatus);
      await service.sendMessage('c', null);

      // A fresh bot instance per send; the `type` argument does not affect routing.
      expect(telegrafMock.Telegraf).toHaveBeenCalledTimes(3);
      expect(telegrafMock.__sendMessage.mock.calls).toEqual([
        ['-1004242', 'a'],
        ['-1004242', 'b'],
        ['-1004242', 'c'],
      ]);
    });

    it('is a no-op when telegram is disabled', async () => {
      await seedEnabledSettings({ [Telegram.Enabled]: SettingsValues.NO });

      await service.sendMessage('suppressed', null);

      expect(telegrafMock.Telegraf).not.toHaveBeenCalled();
      expect(telegrafMock.__sendMessage).not.toHaveBeenCalled();
    });

    it('is a no-op when no settings are stored at all', async () => {
      await service.sendMessage('suppressed', null);

      expect(telegrafMock.Telegraf).not.toHaveBeenCalled();
    });

    it('is a no-op when the bot token is missing', async () => {
      await seedEnabledSettings({ [Telegram.BotToken]: '' });

      await service.sendMessage('suppressed', null);

      expect(telegrafMock.Telegraf).not.toHaveBeenCalled();
      expect(telegrafMock.__sendMessage).not.toHaveBeenCalled();
    });

    it('is a no-op when the chat id is missing', async () => {
      await seedEnabledSettings({ [Telegram.ChatId]: '' });

      await service.sendMessage('suppressed', null);

      expect(telegrafMock.Telegraf).not.toHaveBeenCalled();
      expect(telegrafMock.__sendMessage).not.toHaveBeenCalled();
    });

    it('swallows telegram API errors instead of rethrowing', async () => {
      await seedEnabledSettings();
      telegrafMock.__sendMessage.mockRejectedValueOnce(new Error('telegram is down'));

      await expect(service.sendMessage('boom', null)).resolves.toBeUndefined();
    });
  });

  describe('test', () => {
    it('sends the fixed test message through the configured bot', async () => {
      await seedEnabledSettings();

      await service.test();

      expect(telegrafMock.__sendMessage).toHaveBeenCalledWith('-1004242', 'Test message');
    });

    it('resolves even when the telegram API fails (sendMessage swallows the error)', async () => {
      // The BadRequestException branch in test() is unreachable in practice
      // because sendMessage never rethrows.
      await seedEnabledSettings();
      telegrafMock.__sendMessage.mockRejectedValueOnce(new Error('bad token'));

      await expect(service.test()).resolves.toBeUndefined();
    });
  });
});
