import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ReportBalanceOperation } from './entities/report-balance-operation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class ReportBalanceOperationsService extends TypeOrmCrudService<ReportBalanceOperation> {

  constructor(
    @InjectRepository(ReportBalanceOperation, AMTS_DB_NAME)
    readonly repo: Repository<ReportBalanceOperation>,
  ) {
    super(repo);
  }
}
