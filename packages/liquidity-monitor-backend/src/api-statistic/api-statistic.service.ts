import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { ApiStatistic } from "./entities/api-statistic.entity";
import { SERVICES } from "./api-statistic.constants";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ApiStatisticService implements OnModuleInit, OnModuleDestroy {
  private lastInsertedId: string
  private logger = new Logger(ApiStatisticService.name);

  constructor(
    private readonly repo: Repository<ApiStatistic>,
    private serviceName?: string,
  ) {}

  async onModuleInit() {
    if (!this.serviceName) {
      this.logger.warn('Skip api statistic service initialization. Provide service name to enable it.');
      return;
    }

    const apiStatistic = new ApiStatistic();
    apiStatistic.serviceName = SERVICES.TID_API;
    apiStatistic.uptimePeriod = `[${new Date().toISOString()},)`;

    const savedRecord = await this.repo.save(apiStatistic);
    this.lastInsertedId = savedRecord.id;
  }

  async update() {
    const now = new Date();

    // Set the uptime period for the last record
    await this.repo.createQueryBuilder("as")
      .update(ApiStatistic)
      .set({
        uptimePeriod: () => `tstzrange(lower(uptime_period), '${now.toISOString()}', '[)')`,
      })
      .where("id = :id", { id: this.lastInsertedId })
      .execute();
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async updateUptimeStatistic() {
    await this.update();
  }

  async onModuleDestroy() {
    if (!this.serviceName) {
      return;
    }

    await this.update();
  }
}
