import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../tp-db/tp-db.config";

@Injectable()
export class EcnInstrumentsService extends TypeOrmCrudService<EcnInstrument> {
  constructor(
    @InjectRepository(EcnInstrument, TP_DB_NAME)
    readonly repo: Repository<EcnInstrument>,
  ) {
    super(repo);
  }
}
