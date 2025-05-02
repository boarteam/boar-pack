import { Injectable } from "@nestjs/common";
import { In, Like, Repository } from "typeorm";
import { Setting } from "./entities/setting.entity";
import { EventSettingsDto } from "./dto/event-settings.dto";
import { SettingsValues } from "./settings.constants";

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

  async getEventSettings(): Promise<EventSettingsDto> {
    const settings = await this.repo.find({
      where: {
        key: Like('notifications.%'),
      }
    });

    const eventSettings = new EventSettingsDto();
    settings.forEach(setting => {
      eventSettings[setting.key] = setting.value === SettingsValues.YES
    });

    return eventSettings;
  }

  async setEventSettings(updateDto: EventSettingsDto): Promise<void> {
    const settings: Pick<Setting, 'key' | 'value'>[] = [];

    for (const key in updateDto) {
      settings.push({
        key: key,
        value: updateDto[key] ? SettingsValues.YES : SettingsValues.NO,
      });
    }

    await this.repo.upsert(settings, ['key']);
  }
}
