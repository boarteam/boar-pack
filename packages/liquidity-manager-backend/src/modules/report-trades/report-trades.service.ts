import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ReportTrade } from './entities/report-trade.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class ReportTradesService extends TypeOrmCrudService<ReportTrade> {

  constructor(
    @InjectRepository(ReportTrade, AMTS_DB_NAME)
    readonly repo: Repository<ReportTrade>,
  ) {
    super(repo);
  }
}
