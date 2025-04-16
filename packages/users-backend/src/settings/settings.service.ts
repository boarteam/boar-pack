import { Injectable } from "@nestjs/common";
import { TelegramSettingsUpdateDto } from "./dto/telegram-settings-update.dto";
import { TelegramSettingsDto } from "./dto/telegram-settings.dto";
import { In, Repository } from "typeorm";
import { Setting } from "./entities/setting.entity";
import { Notifications, Telegram } from "./settings.constants";

export const settingsToDtoPropMap = {
  [Telegram.Enabled]: 'enabled',
  [Telegram.BotToken]: 'botToken',
  [Telegram.ChatId]: 'chatId',
  [Notifications.InstrumentsStatus]: 'notifyAboutInstruments',
  [Notifications.PlatformStatus]: 'notifyAboutPlatforms',
} as const;

@Injectable()
export class SettingsService {
  constructor(
    readonly repo: Repository<Setting>,
  ) {
  }

  public getSettings(settingsNames: string[]): Promise<Setting[]> {
    return this.repo.find({
      where: {
        key: In(settingsNames),
      }
    });
  }

  async updateSettings(settings: Pick<Setting, 'key' | 'value'>[]): Promise<void> {
    await this.repo.upsert(settings, ['key']);
  }

  async getTelegramSettings(): Promise<TelegramSettingsDto> {
    const settings = await this.repo.find({
      where: {
        key: In([
          Telegram.Enabled,
          Telegram.BotToken,
          Telegram.ChatId,
          Notifications.InstrumentsStatus,
          Notifications.PlatformStatus,
        ]),
      }
    });

    const telegramSettings = {
      enabled: false,
      botToken: '',
      chatId: '',
      notifyAboutInstruments: false,
      notifyAboutPlatforms: false,
    };
    settings.forEach((setting) => {
      switch (setting.key) {
        case Telegram.Enabled:
        case Notifications.InstrumentsStatus:
        case Notifications.PlatformStatus:
          telegramSettings[settingsToDtoPropMap[setting.key]] = setting.value === 'yes';
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

    [
      Telegram.Enabled,
      Notifications.InstrumentsStatus,
      Notifications.PlatformStatus,
    ].forEach((key) => {
      const dtoKey = settingsToDtoPropMap[key];
      if (dtoKey in updateDto) {
        settings.push({
          key,
          value: updateDto[dtoKey] ? 'yes' : 'no',
        });
      }
    });

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

    await this.repo.upsert(settings, ['key']);
  }
}
