import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnModule } from './entities/ecn-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Injectable()
export class EcnModulesService extends TypeOrmCrudService<EcnModule> {
  constructor(
    @InjectRepository(EcnModule, AMTS_DB_NAME)
    readonly repo: Repository<EcnModule>,
  ) {
    super(repo);
  }
}
