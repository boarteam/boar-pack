import { Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { RevokedToken } from './entities/revoked-token.entity';
import { RevokedTokensService } from './revoked-tokens.service';
import { DataSource } from 'typeorm';
import { ScheduleModule } from "@nestjs/schedule";

@Module({})
export class RevokedTokensModule {
  static register(config: { dataSourceName?: string } = {}) {
    return {
      module: RevokedTokensModule,
      imports: [
        TypeOrmModule.forFeature([RevokedToken], config.dataSourceName),
        ScheduleModule.forRoot(),
      ],
      providers: [
        {
          provide: RevokedTokensService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new RevokedTokensService(dataSource.getRepository(RevokedToken));
          }
        },
      ],
      exports: [RevokedTokensService],
    };
  }
}
