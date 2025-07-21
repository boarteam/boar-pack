import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from "typeorm";
import { Notifications, SettingsService, SettingsValues, TelegrafService } from "@boarteam/boar-pack-users-backend";
import { bold, fmt } from "telegraf/format";
import { QuotesStatisticService, TProvider } from "../quotes-statistic";
import { ProvidersProblematicPeriod } from "./entities/providers-problematic-period.entity";

type TOpenProblematicPeriod = {
  providerId: TProvider['id'];
  id: ProvidersProblematicPeriod['id'];
  problematicPeriod: string;
  problematicPeriodStart: Date;
};

@Injectable()
export class ProviderMonitoringService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProviderMonitoringService.name);
  // We'll store here notification attempts and retry attempts with exponential backoff (seconds)
  // { providerName: { attempts: 0 - 4, lastNotification: Date }}
  private notificationsJournal = new Map<TProvider['id'], {
    attempts: number,
    lastNotification: number
  }>();
  private readonly exponentialBackoff = [299, 599, 1799, 3599];
  private providerActivityInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly dataSource: DataSource,
    private readonly telegrafService: TelegrafService,
    private readonly settingsService: SettingsService,
    private readonly quotesStatistic: QuotesStatisticService,
    private readonly fetchProviders: () => Promise<TProvider[]>,
  ) {
  }

  async onModuleInit() {
    if (process.env.SWAGGER === 'true') {
      return;
    }

    const setting = await this.getSetting(Notifications.QuotesByProviderStatus);
    if (setting === SettingsValues.YES) {
      this.startMonitoring();
    }
  }

  onModuleDestroy() {
    if (process.env.SWAGGER === 'true') {
      return;
    }

    this.stopMonitoring();
  }

  private async getSetting(settingName: string): Promise<string> {
    const result = await this.settingsService.getSettings([settingName]);
    return result?.[0]?.value || SettingsValues.NO;
  }

  private startMonitoring() {
    if (this.providerActivityInterval) {
      return;
    }

    this.logger.log('Starting provider activity monitoring...');
    this.providerActivityInterval = setInterval(async () => {
      try {
        await this.checkProviderActivity()
      } catch (error) {
        this.logger.error('Error during provider activity check');
        this.logger.error(error, error.stack);
      }
    }, 10000);
  }

  stopMonitoring() {
    if (this.providerActivityInterval) {
      clearInterval(this.providerActivityInterval);
      this.providerActivityInterval = null;
      this.logger.log('Stopped provider activity monitoring.');
    }
  }

  private async getOpenProblematicPeriods(providerIds: TProvider['id'][]): Promise<Map<
    ProvidersProblematicPeriod['providerId'],
    TOpenProblematicPeriod
  >> {
    const result: TOpenProblematicPeriod[] = await this.dataSource
      .getRepository(ProvidersProblematicPeriod)
      .createQueryBuilder('ppp')
      .select('ppp.id', 'id')
      .addSelect('ppp.providerId', 'providerId')
      .addSelect('ppp.period', 'problematicPeriod')
      .addSelect('lower(ppp.period)', 'problematicPeriodStart')
      .where('ppp.providerId IN (:...providerIds) and upper(ppp.period) is null', { providerIds })
      .getRawMany();

    return new Map(result.map(row => [row.providerId, {
      providerId: row.providerId,
      id: row.id,
      problematicPeriod: row.problematicPeriod,
      problematicPeriodStart: new Date(row.problematicPeriodStart),
    }]));
  }

  private async checkProviderActivity() {
    const providers = (await this.fetchProviders())
      .filter(provider => provider.threshold) // Skip providers without a threshold;

    const providersIds = providers.map(provider => provider.id);

    if (!providersIds.length) {
      this.logger.warn('No providers with thresholds found, skipping activity check.');
      return;
    }

    const latestQuotesByProviders = await this.quotesStatistic.getLatestQuotesByProvider(providersIds);

    await Promise.allSettled([
      this.updateProblematicPeriods(providers, latestQuotesByProviders),
      this.sendNotifications(providers, latestQuotesByProviders),
    ]);
  }

  private async updateProblematicPeriods(providers: TProvider[], latestQuotesByProviders: Map<TProvider['id'], Date | null>) {
    const openProblematicPeriods = await this.getOpenProblematicPeriods(providers.map(provider => provider.id));
    const problematicPeriods: Partial<ProvidersProblematicPeriod>[] = [];
    const now = Date.now();

    providers.forEach((provider: TProvider) => {
      const latestQuoteDate = latestQuotesByProviders.get(provider.id);
      const diff = latestQuoteDate ? (now - latestQuoteDate.getTime()) / 1000 : null;
      const isProblematic = diff === null || provider.threshold && (diff > provider.threshold);
      const problematicPeriod = openProblematicPeriods.get(provider.id);

      if (isProblematic && !problematicPeriod) {
        this.logger.warn(`Opening problematic period for provider ${provider.name} with threshold ${provider.threshold}`);
        problematicPeriods.push({
          providerId: provider.id,
          period: `[${new Date().toISOString()},)`,
        })
      } else if (!isProblematic && problematicPeriod) {
        this.logger.log(`Closing problematic period for provider ${provider.name}`);
        problematicPeriods.push({
          id: problematicPeriod.id,
          providerId: provider.id,
          period: `[${problematicPeriod.problematicPeriodStart.toISOString()}, '${new Date(now).toISOString()}]`,
        });
      }
    });

    // Save problematic periods to the database
    if (problematicPeriods.length > 0) {
      const repository = this.dataSource.getRepository(ProvidersProblematicPeriod);
      await repository.upsert(problematicPeriods, ['id']);
      this.logger.log(`Saved ${problematicPeriods.length} problematic periods.`);
    } else {
      this.logger.debug('No problematic periods to save.');
    }
  }

  private async sendNotifications(providers: TProvider[], latestQuotesByProviders: Map<TProvider['id'], Date | null>) {
    const notifications: Promise<void>[] = [];
    const telegramNotificationsEnabled = await this.getSetting(Notifications.QuotesByProviderStatus);

    if (telegramNotificationsEnabled !== SettingsValues.YES) {
      this.logger.debug('Telegram notifications are disabled, skipping notifications.');
      return;
    }

    const now = Date.now();
    providers.forEach((provider: TProvider) => {
      const latestQuoteDate = latestQuotesByProviders.get(provider.id);
      const diff = latestQuoteDate ? (now - latestQuoteDate.getTime()) / 1000 : null;
      const isProblematic = diff === null || provider.threshold && (diff > provider.threshold);

      if (isProblematic) {
        const log = diff === null ? `Provider ${provider.name} has no quotes` : `Provider ${provider.name} has no quotes in the last ${diff} seconds`;
        this.logger.warn(log);

        // Exponential backoff strategy
        const previousNotification = this.notificationsJournal.get(provider.id);
        if (previousNotification) {
          const diff = (now - previousNotification.lastNotification) / 1000;
          if (previousNotification.attempts >= this.exponentialBackoff.length || diff < this.exponentialBackoff[previousNotification.attempts]) {
            this.logger.warn(`Skipping notification for ${provider.name} due to exponential backoff`);
            return;
          }
        }

        const message = fmt`❗️${bold('Provider')} ${bold(provider.name)} has no quotes in the last ${bold(diff || provider.threshold || 'unknown')} seconds.`;
        notifications.push(
          this.telegrafService.sendMessage(message, Notifications.QuotesByProviderStatus)
        );

        this.notificationsJournal.set(provider.id, {
          attempts: (previousNotification ? previousNotification.attempts + 1 : 0),
          lastNotification: now,
        });
      } else {
        if (this.notificationsJournal.has(provider.id)) {
          this.logger.log(`Resetting notification attempts for provider ${provider.name}`);
          notifications.push(
            this.telegrafService.sendMessage(
              fmt`✅${bold('Provider')} ${bold(provider.name)} is active again.`,
              Notifications.QuotesByProviderStatus
            )
          );

          // Reset notification attempts
          this.notificationsJournal.delete(provider.id);
        }
      }
    });


    // Send telegram notifications
    await Promise.all(notifications);
  }
}
