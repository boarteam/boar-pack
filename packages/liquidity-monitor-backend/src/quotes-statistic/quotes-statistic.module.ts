import { Module } from "@nestjs/common";
import { QuotesStatisticService } from "./quotes-statistic.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotesStatistic } from "./entities/quotes-statistic.entity";
import { QuotesStatisticsController } from "./quotes-statistic.controller";
import { ScheduleModule } from "@nestjs/schedule";

@Module({})
export class QuotesStatisticModule {
  static forRoot() {
    const scheduleModule = process.env.SWAGGER ? [] : [ScheduleModule.forRoot()];

    return {
      module: QuotesStatisticModule,
      imports: [
        ...scheduleModule,
        TypeOrmModule.forFeature([QuotesStatistic]),
      ],
      providers: [
        QuotesStatisticService,
      ],
      exports: [
        QuotesStatisticService,
      ],
      controllers: [
        QuotesStatisticsController,
      ],
    };
  }

  static forFeature() {
    const scheduleModule = process.env.SWAGGER ? [] : [ScheduleModule.forRoot()];

    return {
      module: QuotesStatisticModule,
      imports: [
        ...scheduleModule,
        TypeOrmModule.forFeature([QuotesStatistic]),
      ],
      providers: [
        QuotesStatisticService,
      ],
      exports: [
        QuotesStatisticService,
      ],
      controllers: [],
    };
  }
}
