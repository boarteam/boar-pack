import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnInstrumentsGroup } from './entities/ecn-instruments-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../app/amts-typeorm.config";

@Injectable()
export class EcnInstrumentsGroupsService extends TypeOrmCrudService<EcnInstrumentsGroup> {
  constructor(
    @InjectRepository(EcnInstrumentsGroup, AMTS_DB_NAME)
    readonly repo: Repository<EcnInstrumentsGroup>,
  ) {
    super(repo);
  }
}
