import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Notifications, TelegrafService, SettingsService, SettingsValues } from "@boarteam/boar-pack-users-backend";
import { fmt, bold } from "telegraf/format";
import { FETCH_PROVIDERS } from "./provider-monitoring.constants";
import { keyBy } from "lodash";
import { QuotesStatistic } from "../quotes-statistic";
import { TProvider } from "./provider-monitoring.module";

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
    private readonly settingsService: SettingsService,
    @Inject(FETCH_PROVIDERS) private readonly fetchProviders: () => Promise<TProvider[]>,
  ) {
  }

  async onModuleInit() {
    const setting = await this.getSetting();
    if (setting === SettingsValues.YES) {
      this.startMonitoring();
    }
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  private async getSetting(): Promise<string> {
    const result = await this.settingsService.getSettings([Notifications.QuotesByProviderStatus]);
    return result?.[0]?.value || SettingsValues.NO;
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
    setting === SettingsValues.NO ? this.stopMonitoring() : this.startMonitoring();
  }

  private async checkProviderActivity() {
    const providers = await this.fetchProviders();

    if (!providers.length) {
      return;
    }

    const result = await this.dataSource
      .getRepository(QuotesStatistic)
      .createQueryBuilder('qs')
      .select('qs.quotes_provider_name as name')
      .addSelect('max(qs.created_at) as "latestQuoteDate"')
      .where('qs.quotes_provider_name IN (:...names)', {
        names: providers.map(provider => provider.id),
      })
      .groupBy('qs.quotes_provider_name')
      .getRawMany();

    const quotesByProviders = keyBy(result, 'name');
    const notifications: Promise<void>[] = [];

    providers.map(provider => {
      const latestQuote = quotesByProviders[provider.id];

      const isProblematic = !latestQuote || new Date().getTime() - new Date(latestQuote.latestQuoteDate).getTime() > provider.threshold * 1000;

      if (isProblematic) {
        this.logger.warn(`Provider ${provider.name} has no quotes in the last ${provider.threshold} seconds`);

        // Exponential backoff strategy
        const previousNotification = this.notificationsJournal.get(provider.name);
        if (previousNotification) {
          const now = new Date();
          const diff = (now.getTime() - previousNotification.lastNotification.getTime()) / 1000;
          if (diff < this.exponentialBackoff[previousNotification.attempts]) {
            this.logger.warn(`Skipping notification for ${provider.name} due to exponential backoff`);
            return;
          }
          previousNotification.attempts++;
          previousNotification.lastNotification = now;

          if (previousNotification.attempts >= this.exponentialBackoff.length) {
            previousNotification.attempts = 0;
          }
        }

        const message = fmt`❗️${bold('Provider')} ${bold(provider.name)} has no quotes in the last ${bold(provider.threshold.toString())} seconds.`;
        notifications.push(
          this.telegrafService.sendMessage(message, Notifications.QuotesByProviderStatus)
        );

        this.notificationsJournal.set(provider.name, previousNotification || {
          attempts: 0,
          lastNotification: new Date(),
        });
      }
    });
    await Promise.all(notifications);
  }
}
