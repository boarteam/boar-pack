import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnSubscrSchema } from './entities/ecn-subscr-schema.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../tp-db/tp-db.config";

@Injectable()
export class EcnSubscrSchemaService extends TypeOrmCrudService<EcnSubscrSchema> {
  constructor(
    @InjectRepository(EcnSubscrSchema, TP_DB_NAME)
    readonly repo: Repository<EcnSubscrSchema>,
  ) {
    super(repo);
  }
}
