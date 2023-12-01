import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnInstrumentsGroup } from './entities/ecn-instruments-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../app/tp-typeorm.config";

@Injectable()
export class EcnInstrumentsGroupsService extends TypeOrmCrudService<EcnInstrumentsGroup> {
  constructor(
    @InjectRepository(EcnInstrumentsGroup, TP_DB_NAME)
    readonly repo: Repository<EcnInstrumentsGroup>,
  ) {
    super(repo);
  }
}
