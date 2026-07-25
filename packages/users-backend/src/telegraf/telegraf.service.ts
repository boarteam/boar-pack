import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Notifications, Setting, SettingsService, SettingsValues } from '../settings';
import { FmtString } from 'telegraf/format';

import { Telegraf } from 'telegraf';
import { Telegram } from './telegraf.constants';
import { TelegramSettingsDto } from './dto/telegram-settings.dto';
import { TelegramSettingsUpdateDto } from './dto/telegram-settings-update.dto';

export const settingsToDtoPropMap = {
  [Telegram.Enabled]: 'enabled',
  [Telegram.BotToken]: 'botToken',
  [Telegram.ChatId]: 'chatId',
} as const;

@Injectable()
export class TelegrafService {
  private readonly logger = new Logger(TelegrafService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async getTelegramSettings(): Promise<TelegramSettingsDto> {
    const settings = await this.settingsService.getSettings([
      Telegram.Enabled,
      Telegram.BotToken,
      Telegram.ChatId,
    ]);

    const telegramSettings = {
      enabled: false,
      botToken: '',
      chatId: '',
    };
    settings.forEach((setting) => {
      switch (setting.key) {
        case Telegram.Enabled:
          telegramSettings[settingsToDtoPropMap[setting.key]] =
            setting.value === SettingsValues.YES;
          break;

        case Telegram.BotToken:
        case Telegram.ChatId:
          telegramSettings[settingsToDtoPropMap[setting.key]] = setting.value;
          break;
      }
    });

    return telegramSettings;
  }

  async setTelegramSettings(updateDto: TelegramSettingsUpdateDto): Promise<void> {
    const settings: Pick<Setting, 'key' | 'value'>[] = [];

    if (updateDto.enabled !== undefined) {
      settings.push({
        key: Telegram.Enabled,
        value: updateDto.enabled ? SettingsValues.YES : SettingsValues.NO,
      });
    }

    if (updateDto.botToken) {
      settings.push({
        key: Telegram.BotToken,
        value: updateDto.botToken,
      });
    }

    if (updateDto.chatId) {
      settings.push({
        key: Telegram.ChatId,
        value: updateDto.chatId,
      });
    }

    await this.settingsService.updateSettings(settings);
  }

  /**
   * Sends a notification, unless telegram is disabled, unconfigured, or the
   * notification type has been switched off in the settings. Delivery failures
   * are logged, never thrown: notifications must not break their caller.
   */
  async sendMessage(message: string | FmtString, type: Notifications | null): Promise<void> {
    const config = await this.getTelegramSettings();
    if (!config.enabled) {
      this.logger.log('Suppressed telegram message because it is disabled');
      return;
    }

    if (!config.botToken || !config.chatId) {
      this.logger.log('Suppressed telegram message because bot token or chat id is not set');
      return;
    }

    if (type && (await this.isNotificationDisabled(type))) {
      this.logger.log(`Suppressed telegram message because ${type} notifications are disabled`);
      return;
    }

    try {
      await this.deliver(config, message);
    } catch (e) {
      this.logger.error('Failed to send telegram message');
      this.logger.error(e, e instanceof Error ? e.stack : undefined);
    }
  }

  /**
   * Connectivity check for the configured bot: unlike sendMessage it reports
   * failures to the caller, and it ignores the enabled flag and the per-type
   * toggles — it answers "do these credentials work", not "should we notify".
   */
  async test() {
    const config = await this.getTelegramSettings();
    if (!config.botToken || !config.chatId) {
      throw new BadRequestException('Bot token or chat id is not set');
    }

    try {
      await this.deliver(config, 'Test message');
    } catch (e) {
      this.logger.error(e, e instanceof Error ? e.stack : undefined);
      throw new BadRequestException('Wrong bot token or chat id');
    }
  }

  private async deliver(
    config: Pick<TelegramSettingsDto, 'botToken' | 'chatId'>,
    message: string | FmtString,
  ): Promise<void> {
    const bot = new Telegraf(config.botToken);
    await bot.telegram.sendMessage(config.chatId, message);
  }

  /**
   * A notification type counts as enabled until it is explicitly switched off,
   * so systems that never configured these toggles keep receiving alerts.
   */
  private async isNotificationDisabled(type: Notifications): Promise<boolean> {
    const [setting] = await this.settingsService.getSettings([type]);
    return setting?.value === SettingsValues.NO;
  }
}
