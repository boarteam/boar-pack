import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SettingsService, settingsToDtoPropMap } from "../settings/settings.service";
import { Notifications } from "../settings/settings.constants";

const { Telegraf } = require('telegraf');

@Injectable()
export class TelegrafService {
  private readonly logger = new Logger(TelegrafService.name);

  constructor(
    private readonly settingsService: SettingsService,
  ) {
  }

  async sendMessage(message: string, type: Notifications | null): Promise<void> {
    const config = await this.settingsService.getTelegramSettings();
    if (!config.enabled) {
      this.logger.log('Suppressed telegram message because it is disabled');
      return;
    }

    if (type && !config[settingsToDtoPropMap[type]]) {
      this.logger.log(`Suppressed telegram message because ${type} notifications are disabled`);
      return;
    }

    const bot = new Telegraf(config.botToken);


    try {
      // @ts-ignore
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
