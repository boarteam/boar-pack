import { Module } from "@nestjs/common";
import { QuotesStatisticService } from "./quotes-statistic.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotesStatistic } from "./entities/quotes-statistic.entity";
import { QuotesStatisticsController } from "./quotes-statistic.controller";

@Module({})
export class QuotesStatisticModule {
  static forRoot() {
    return {
      module: QuotesStatisticModule,
      imports: [
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
    return {
      module: QuotesStatisticModule,
      imports: [
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
