import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../tp-db/tp-db.config";
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';

@Injectable()
export class EcnConnectSchemaSetupLabelsService extends TypeOrmCrudService<EcnConnectSchemaSetupLabel> {
  constructor(
    @InjectRepository(EcnConnectSchemaSetupLabel, TP_DB_NAME)
    readonly repo: Repository<EcnConnectSchemaSetupLabel>,
  ) {
    super(repo);
  }
}
