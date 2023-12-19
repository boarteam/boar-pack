import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnConnectSchema } from './entities/ecn-connect-schema.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../tp-db/tp-db.config";

@Injectable()
export class EcnConnectSchemaService extends TypeOrmCrudService<EcnConnectSchema> {
  constructor(
    @InjectRepository(EcnConnectSchema, TP_DB_NAME)
    readonly repo: Repository<EcnConnectSchema>,
  ) {
    super(repo);
  }
}
