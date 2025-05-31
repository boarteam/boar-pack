import { Module } from "@nestjs/common";
import { InstrumentsHistoryService } from "./instruments-history.service";
import { InstrumentsHistoryController } from "./instruments-history.controller";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { InstrumentsHistory } from "./entities/instruments-history.entity";
import { DataSource } from "typeorm";

@Module({})
export class InstrumentsHistoryModule {
  static forRoot(config: {
    dataSourceName?: string
  }) {
    return {
      module: InstrumentsHistoryModule,
      imports: [
        TypeOrmModule.forFeature([InstrumentsHistory], config.dataSourceName)
      ],
      controllers: [
        InstrumentsHistoryController
      ],
      providers: [
        {
          provide: InstrumentsHistoryService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new InstrumentsHistoryService(dataSource.getRepository(InstrumentsHistory));
          },
        },
      ],
      exports: [
        InstrumentsHistoryService,
      ],
    };
  }
}
