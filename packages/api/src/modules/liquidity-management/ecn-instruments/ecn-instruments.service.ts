import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../app/amts-typeorm.config";

@Injectable()
export class EcnInstrumentsService extends TypeOrmCrudService<EcnInstrument> {
  constructor(
    @InjectRepository(EcnInstrument, AMTS_DB_NAME)
    readonly repo: Repository<EcnInstrument>,
  ) {
    super(repo);
  }
}
