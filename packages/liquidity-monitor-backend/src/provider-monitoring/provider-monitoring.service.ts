import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from "typeorm";
import { Notifications, SettingsService, SettingsValues, TelegrafService } from "@boarteam/boar-pack-users-backend";
import { bold, fmt } from "telegraf/format";
import { keyBy } from "lodash";
import { QuotesStatistic } from "../quotes-statistic";
import { TProvider } from "./provider-monitoring.module";
import { ProvidersProblematicPeriod } from "./entities/providers-problematic-period.entity";

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
    private readonly dataSource: DataSource,
    private readonly telegrafService: TelegrafService,
    private readonly settingsService: SettingsService,
    private readonly fetchProviders: () => Promise<TProvider[]>,
  ) {
  }

  async onModuleInit() {
    if (process.env.SWAGGER === 'true') {
      return;
    }

    this.startMonitoring();
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
    this.providerActivityInterval = setInterval(() => this.checkProviderActivity(), 10000);
  }

  stopMonitoring() {
    if (this.providerActivityInterval) {
      clearInterval(this.providerActivityInterval);
      this.providerActivityInterval = null;
      this.logger.log('Stopped provider activity monitoring.');
    }
  }

  private async checkProviderActivity() {
    const providers = await this.fetchProviders();

    if (!providers.length) {
      return;
    }

    const result = await this.dataSource
      .getRepository(QuotesStatistic)
      .createQueryBuilder('qs')
      .select('qs.quotes_provider_name', 'name')
      .addSelect('max(qs.created_at)',  'latestQuoteDate')
      .addSelect('ppp.id', 'problematicPeriodId')
      .addSelect('ppp.period', 'problematicPeriod')
      .addSelect('lower(ppp.period)', 'problematicPeriodStart')
      .leftJoin(ProvidersProblematicPeriod, 'ppp', 'ppp.providerId = qs.quotes_provider_name::uuid and upper(ppp.period) is null')
      .andWhere('qs.quotes_provider_name IN (:...names)', {
        names: providers
          .filter(provider => provider.threshold) // Skip providers without a threshold
          .map(provider => provider.id),
      })
      .groupBy('qs.quotes_provider_name')
      .addGroupBy('ppp.id')
      .addGroupBy('ppp.period')
      .getRawMany();

    const quotesByProviders = keyBy(result, 'name');
    const notifications: Promise<void>[] = [];
    const problematicPeriods: Partial<ProvidersProblematicPeriod>[] = [];
    const telegramNotificationsEnabled = await this.getSetting(Notifications.QuotesByProviderStatus);

    providers.forEach((provider: TProvider & { threshold: number }) => {
      const latestQuote = quotesByProviders[provider.id];
      const diff = new Date().getTime() - new Date(latestQuote.latestQuoteDate).getTime();
      const isProblematic = !latestQuote || diff > provider.threshold * 1000;

      if (isProblematic) {
        this.logger.warn(`Provider ${provider.name} has no quotes in the last ${provider.threshold} seconds`);

        // Update or create problematic period
        if (!latestQuote.problematicPeriodId) {
          problematicPeriods.push({
            providerId: latestQuote.name,
            period: `[${new Date().toISOString()},)`,
          })
        }

        // Collect telegram notifications
        if (telegramNotificationsEnabled === SettingsValues.YES) {
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
      } else {
        this.logger.log(`Provider ${provider.name} is active, last quote: ${latestQuote.latestQuoteDate}`);

        // Close a problematic period if it exists
        if (latestQuote.problematicPeriodId) {
          problematicPeriods.push({
            id: latestQuote.problematicPeriodId,
            providerId: latestQuote.name,
            period: `[${latestQuote.problematicPeriodStart.toISOString()}, '${new Date().toISOString()}]`,
          });
        }

        // Reset notification attempts
        this.notificationsJournal.delete(provider.name);
      }
    });

    // Save problematic periods to the database
    if (problematicPeriods.length > 0) {
      const repository = this.dataSource.getRepository(ProvidersProblematicPeriod);
      await repository.upsert(problematicPeriods, ['id']);
      this.logger.log(`Saved ${problematicPeriods.length} problematic periods.`);
    } else {
      this.logger.log('No problematic periods to save.');
    }

    // Send telegram notifications
    await Promise.all(notifications);
  }
}
