import { Injectable } from "@nestjs/common";
import { TelegramSettingsUpdateDto } from "./dto/telegram-settings-update.dto";
import { TelegramSettingsDto } from "./dto/telegram-settings.dto";
import { In, Like, Repository } from "typeorm";
import { Setting } from "./entities/setting.entity";
import { Telegram } from "./settings.constants";
import { EventSettingsDto } from "./dto/event-settings.dto";

export const settingsToDtoPropMap = {
  [Telegram.Enabled]: 'enabled',
  [Telegram.BotToken]: 'botToken',
  [Telegram.ChatId]: 'chatId',
} as const;

@Injectable()
export class SettingsService {
  constructor(readonly repo: Repository<Setting>) {
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
        ]),
      }
    });

    const telegramSettings = {
      enabled: false,
      botToken: '',
      chatId: '',
    };
    settings.forEach((setting) => {
      switch (setting.key) {
        case Telegram.Enabled:
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

    if (updateDto.enabled) {
      settings.push({
        key: Telegram.Enabled,
        value: updateDto.enabled ? 'yes' : 'no',
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

    await this.repo.upsert(settings, ['key']);
  }

  async getEventSettings(): Promise<EventSettingsDto> {
    const settings = await this.repo.find({
      where: {
        key: Like('notifications.%'),
      }
    });

    const eventSettings = new EventSettingsDto();
    settings.forEach(setting => {
      eventSettings[setting.key] = setting.value === 'yes'
    });

    return eventSettings;
  }

  async setEventSettings(updateDto: EventSettingsDto): Promise<void> {
    const settings: Pick<Setting, 'key' | 'value'>[] = [];

    for (const key in updateDto) {
      settings.push({
        key: key,
        value: updateDto[key] ? 'yes' : 'no',
      });
    }

    await this.repo.upsert(settings, ['key']);
  }
}
