import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { ApiStatistic } from "./entities/api-statistic.entity";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SERVICES } from "./api-statistic.constants";

@Injectable()
export class ApiStatisticService implements OnModuleInit {
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
    apiStatistic.lastCheckedAt = new Date();

    if (!this.lastInsertedId) {
      const savedRecord = await this.repo.save(apiStatistic);
      this.lastInsertedId = savedRecord.id;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkService(): Promise<void> {
    await this.repo.update({
      id: this.lastInsertedId,
    }, {
      lastCheckedAt: new Date(),
    })
  }
}
