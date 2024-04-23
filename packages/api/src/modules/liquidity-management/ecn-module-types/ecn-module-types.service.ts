import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnModuleType } from './entities/ecn-module-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../liquidity-app.config";

@Injectable()
export class EcnModuleTypesService extends TypeOrmCrudService<EcnModuleType> {
  constructor(
    @InjectRepository(EcnModuleType, TP_DB_NAME)
    readonly repo: Repository<EcnModuleType>,
  ) {
    super(repo);
  }
}
