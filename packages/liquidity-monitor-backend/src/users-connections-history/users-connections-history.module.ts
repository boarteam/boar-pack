import { Module } from "@nestjs/common";
import { UsersConnectionsHistoryService } from "./users-connections-history.service";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ScheduleModule } from "@boarteam/boar-pack-common-backend";
import { UsersConnectionsHistoryController } from "./users-connections-history.controller";
import { UsersConnectionsHistory } from "./entities/users-connections-history.entity";

@Module({
  imports: [
    ScheduleModule,
  ],
  exports: [
    UsersConnectionsHistoryService,
  ],
  controllers: [
    UsersConnectionsHistoryController,
  ],
})
export class UsersConnectionsHistoryModule {
  static forRoot(config: {
    dataSourceName: string
  }) {
    return {
      module: UsersConnectionsHistoryModule,
      imports: [
        TypeOrmModule.forFeature([UsersConnectionsHistory], config.dataSourceName),
      ],
      providers: [
        {
          provide: UsersConnectionsHistoryService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new UsersConnectionsHistoryService(dataSource.getRepository(UsersConnectionsHistory));
          },
        },
      ],
    }
  }
}
