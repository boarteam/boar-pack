import { Module } from "@nestjs/common";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { ApiStatistic } from "./entities/api-statistic.entity";
import { ApiStatisticService } from "./api-statistic.service";
import { ScheduleModule } from "@boarteam/boar-pack-common-backend";
import { DataSource } from "typeorm";

@Module({})
export class ApiStatisticModule {
  static forRoot(config: {
    dataSourceName?: string
    serviceName?: string
  }) {
    return {
      module: ApiStatisticModule,
      imports: [
        ScheduleModule,
        TypeOrmModule.forFeature([ApiStatistic], config.dataSourceName),
      ],
      providers: [
        {
          provide: ApiStatisticService,
          inject: [
            getDataSourceToken(config.dataSourceName),
          ],
          useFactory: (
            dataSource: DataSource,
          ) => {
            return new ApiStatisticService(
              dataSource.getRepository(ApiStatistic),
              config.serviceName
            );
          },
        },
      ],
      exports: [
        ApiStatisticService,
      ],
    };
  }
}
