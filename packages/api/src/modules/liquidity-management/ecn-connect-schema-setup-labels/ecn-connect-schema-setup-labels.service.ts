import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';

@Injectable()
export class EcnConnectSchemaSetupLabelsService extends TypeOrmCrudService<EcnConnectSchemaSetupLabel> {
  constructor(
    @InjectRepository(EcnConnectSchemaSetupLabel, AMTS_DB_NAME)
    readonly repo: Repository<EcnConnectSchemaSetupLabel>,
  ) {
    super(repo);
  }
}
