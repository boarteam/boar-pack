import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Notifications, Setting, SettingsService, SettingsValues } from "../settings";
import { FmtString } from "telegraf/format";

import { Telegraf } from "telegraf";
import { Telegram } from "./telegraf.constants";
import { TelegramSettingsDto } from "./dto/telegram-settings.dto";
import { TelegramSettingsUpdateDto } from "./dto/telegram-settings-update.dto";

export const settingsToDtoPropMap = {
  [Telegram.Enabled]: 'enabled',
  [Telegram.BotToken]: 'botToken',
  [Telegram.ChatId]: 'chatId',
} as const;

@Injectable()
export class TelegrafService {
  private readonly logger = new Logger(TelegrafService.name);

  constructor(
    private readonly settingsService: SettingsService,
  ) {
  }

  async getTelegramSettings(): Promise<TelegramSettingsDto> {
    const settings = await this.settingsService.getSettings([
      Telegram.Enabled,
      Telegram.BotToken,
      Telegram.ChatId
    ])

    const telegramSettings = {
      enabled: false,
      botToken: '',
      chatId: '',
    };
    settings.forEach((setting) => {
      switch (setting.key) {
        case Telegram.Enabled:
          telegramSettings[settingsToDtoPropMap[setting.key]] = setting.value === SettingsValues.YES;
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

    if (updateDto.enabled) {
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

    const bot = new Telegraf(config.botToken);

    try {
      await bot.telegram.sendMessage(config.chatId, message);
    } catch (e) {
      this.logger.error('Failed to send telegram message');
      this.logger.error(e, e.stack);
    }
  }

  async test() {
    try {
      return await this.sendMessage('Test message', null);
    } catch (e) {
      this.logger.error(e, e.stack);
      throw new BadRequestException('Wrong bot token or chat id')
    }
  }
}
