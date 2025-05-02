import { Module } from "@nestjs/common";
import { QuotesStatisticService } from "./quotes-statistic.service";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { QuotesStatistic } from "./entities/quotes-statistic.entity";
import { QuotesStatisticsController } from "./quotes-statistic.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { DataSource } from "typeorm";

@Module({})
export class QuotesStatisticModule {
  static forRoot(config: {
    dataSourceName?: string
  }) {
    const scheduleModule = process.env.SWAGGER ? [] : [ScheduleModule.forRoot()];

    return {
      module: QuotesStatisticModule,
      imports: [
        ...scheduleModule,
        TypeOrmModule.forFeature([QuotesStatistic], config.dataSourceName),
      ],
      providers: [
        {
          provide: QuotesStatisticService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new QuotesStatisticService(dataSource.getRepository(QuotesStatistic), dataSource);
          },
        },
      ],
      exports: [
        QuotesStatisticService,
      ],
      controllers: [
        QuotesStatisticsController,
      ],
    };
  }

  static forFeature(config: {
    dataSourceName?: string
  }) {
    const scheduleModule = process.env.SWAGGER ? [] : [ScheduleModule.forRoot()];

    return {
      module: QuotesStatisticModule,
      imports: [
        ...scheduleModule,
        TypeOrmModule.forFeature([QuotesStatistic], config.dataSourceName),
      ],
      providers: [
        {
          provide: QuotesStatisticService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new QuotesStatisticService(dataSource.getRepository(QuotesStatistic), dataSource);
          },
        },
      ],
      exports: [
        QuotesStatisticService,
      ],
      controllers: [],
    };
  }
}
