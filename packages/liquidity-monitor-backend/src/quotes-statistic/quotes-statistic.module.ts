import { Module } from "@nestjs/common";
import { QuotesStatisticService } from "./quotes-statistic.service";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { QuotesStatistic } from "./entities/quotes-statistic.entity";
import { QuotesStatisticsController } from "./quotes-statistic.controller";
import { DataSource } from "typeorm";
import { ScheduleModule } from "@boarteam/boar-pack-common-backend";

@Module({})
export class QuotesStatisticModule {
  static forRoot(config: {
    dataSourceName?: string
  }) {
    return {
      module: QuotesStatisticModule,
      imports: [
        ScheduleModule,
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
    return {
      module: QuotesStatisticModule,
      imports: [
        ScheduleModule,
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
