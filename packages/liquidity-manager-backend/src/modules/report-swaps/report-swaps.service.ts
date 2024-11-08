import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ReportSwap } from './entities/report-swap.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class ReportSwapsService extends TypeOrmCrudService<ReportSwap> {

  constructor(
    @InjectRepository(ReportSwap, TP_DB_NAME)
    readonly repo: Repository<ReportSwap>,
  ) {
    super(repo);
  }
}
