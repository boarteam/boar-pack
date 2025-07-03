import { Module } from "@nestjs/common";
import { UsersConnectionsStatisticService } from "./users-connections-statistic.service";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ScheduleModule } from "@boarteam/boar-pack-common-backend";
import { UsersConnectionsStatistic } from "./entities/users-connections-statistic.entity";
import { UsersConnectionsStatisticController } from "./users-connections-statistic.controller";

@Module({})
export class UsersConnectionsStatisticModule {
  static forRoot(config: {
    dataSourceName: string
  }) {
    return {
      module: UsersConnectionsStatisticModule,
      imports: [
        ScheduleModule,
        TypeOrmModule.forFeature([UsersConnectionsStatistic], config.dataSourceName),
      ],
      providers: [
        {
          provide: UsersConnectionsStatisticService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new UsersConnectionsStatisticService(dataSource.getRepository(UsersConnectionsStatistic), dataSource);
          },
        },
      ],
      exports: [
        UsersConnectionsStatisticService,
      ],
      controllers: [
        UsersConnectionsStatisticController,
      ],
    };
  }

  static forFeature(config: {
    dataSourceName: string
  }) {
    return {
      module: UsersConnectionsStatisticModule,
      imports: [
        ScheduleModule,
        TypeOrmModule.forFeature([UsersConnectionsStatistic], config.dataSourceName),
      ],
      providers: [
        {
          provide: UsersConnectionsStatisticService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new UsersConnectionsStatisticService(dataSource.getRepository(UsersConnectionsStatistic), dataSource);
          },
        },
      ],
      exports: [
        UsersConnectionsStatisticService,
      ],
      controllers: [],
    };
  }
}
