import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnModule } from './entities/ecn-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../app/tp-typeorm.config";

@Injectable()
export class EcnModulesService extends TypeOrmCrudService<EcnModule> {
  constructor(
    @InjectRepository(EcnModule, TP_DB_NAME)
    readonly repo: Repository<EcnModule>,
  ) {
    super(repo);
  }
}
