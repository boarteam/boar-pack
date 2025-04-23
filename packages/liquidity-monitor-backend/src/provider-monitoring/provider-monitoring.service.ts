import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Notifications, TelegrafService } from "@boarteam/boar-pack-users-backend";
import { fmt, bold } from "telegraf/format";

type TProviderActivity = {
  latestQuoteDate: string,
  name: string,
  threshold: number
}

@Injectable()
export class ProviderMonitoringService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProviderMonitoringService.name);
  // We'll store here notification attempts and retry attempts with exponential backoff (seconds)
  // { providerName: { attempts: 0 - 4, lastNotification: Date }}
  private notificationsJournal = new Map<string, {
    attempts: number,
    lastNotification: Date
  }>();
  private readonly exponentialBackoff = [299, 599, 1799, 3599];
  private providerActivityInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly telegrafService: TelegrafService,
  ) {
  }

  async onModuleInit() {
    const setting = await this.getSetting();
    if (setting === 'yes') {
      this.startMonitoring();
    }
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  private async getSetting(): Promise<string> {
    const result = await this.dataSource.query(`
      select value from settings where key = '${Notifications.QuotesByProviderStatus}'
    `);
    return result?.[0]?.value || 'no';
  }

  private startMonitoring() {
    if (this.providerActivityInterval) {
      return;
    }

    this.logger.log('Starting provider activity monitoring...');
    this.providerActivityInterval = setInterval(() => this.checkProviderActivity(), 10000);
  }

  stopMonitoring() {
    if (this.providerActivityInterval) {
      clearInterval(this.providerActivityInterval);
      this.providerActivityInterval = null;
      this.logger.log('Stopped provider activity monitoring.');
    }
  }

  async toggleMonitoring() {
    const setting = await this.getSetting();
    setting === 'no' ? this.stopMonitoring() : this.startMonitoring();
  }

  private async checkProviderActivity() {
    const result: TProviderActivity[] = await this.dataSource.query(`
        select max(qs.created_at) as "latestQuoteDate", fp.name, fp.threshold
        from "fix-providers" fp
                 left join quotes_statistic qs on fp.id = qs.quotes_provider_name::uuid
    and qs.created_at > (now() - fp.threshold * interval '1 second')
        where fp.enabled
        group by fp.name, fp.threshold;
    `);

    const notifications: Promise<void>[] = [];
    result.forEach(row => {
      if (!row.latestQuoteDate) {
        this.logger.warn(`Provider ${row.name} has no quotes in the last ${row.threshold} seconds`);

        // Exponential backoff strategy
        const previousNotification = this.notificationsJournal.get(row.name);
        if (previousNotification) {
          const now = new Date();
          const diff = (now.getTime() - previousNotification.lastNotification.getTime()) / 1000;
          if (diff < this.exponentialBackoff[previousNotification.attempts]) {
            this.logger.warn(`Skipping notification for ${row.name} due to exponential backoff`);
            return;
          }
          previousNotification.attempts++;
          previousNotification.lastNotification = now;

          if (previousNotification.attempts >= this.exponentialBackoff.length) {
            previousNotification.attempts = 0;
          }
        }

        const message = fmt`❗️${bold('Provider')} ${bold(row.name)} has no quotes in the last ${bold(row.threshold.toString())} seconds.`;
        notifications.push(
          this.telegrafService.sendMessage(message, Notifications.QuotesByProviderStatus)
        );

        this.notificationsJournal.set(row.name, previousNotification || {
          attempts: 0,
          lastNotification: new Date(),
        });
      }
    });
    await Promise.all(notifications);
  }
}
