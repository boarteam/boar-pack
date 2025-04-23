import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SettingsService } from "../settings/settings.service";
import { Notifications } from "../settings/settings.constants";
import { FmtString } from "telegraf/format";

import { Telegraf } from "telegraf";

@Injectable()
export class TelegrafService {
  private readonly logger = new Logger(TelegrafService.name);

  constructor(
    private readonly settingsService: SettingsService,
  ) {
  }

  async sendMessage(message: string | FmtString, type: Notifications | null): Promise<void> {
    const config = await this.settingsService.getTelegramSettings();
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
