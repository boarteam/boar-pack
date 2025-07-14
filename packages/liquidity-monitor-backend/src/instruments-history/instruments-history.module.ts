import { Module } from "@nestjs/common";
import { InstrumentsHistoryService } from "./instruments-history.service";
import { InstrumentsHistoryController } from "./instruments-history.controller";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { InstrumentsHistory } from "./entities/instruments-history.entity";
import { DataSource } from "typeorm";
import { ScheduleModule } from "@boarteam/boar-pack-common-backend";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({})
export class InstrumentsHistoryModule {
  static forRoot(config: {
    dataSourceName?: string
  }) {
    return {
      module: InstrumentsHistoryModule,
      imports: [
        ConfigModule,
        ScheduleModule,
        TypeOrmModule.forFeature([InstrumentsHistory], config.dataSourceName)
      ],
      controllers: [
        InstrumentsHistoryController
      ],
      providers: [
        {
          provide: InstrumentsHistoryService,
          inject: [
            getDataSourceToken(config.dataSourceName),
            SchedulerRegistry,
            ConfigService
          ],
          useFactory: (
            dataSource: DataSource,
            schedulerRegistry: SchedulerRegistry,
            configService: ConfigService
          ) => {
            return new InstrumentsHistoryService(
              dataSource.getRepository(InstrumentsHistory),
              schedulerRegistry,
              configService
            );
          },
        },
      ],
      exports: [
        InstrumentsHistoryService,
      ],
    };
  }
}
