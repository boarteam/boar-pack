import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnModuleType } from './entities/ecn-module-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../app/amts-typeorm.config";

@Injectable()
export class EcnModuleTypesService extends TypeOrmCrudService<EcnModuleType> {
  constructor(
    @InjectRepository(EcnModuleType, AMTS_DB_NAME)
    readonly repo: Repository<EcnModuleType>,
  ) {
    super(repo);
  }
}
