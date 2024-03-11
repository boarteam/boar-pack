import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';
import { QueryJoin } from "@nestjsx/crud-request/lib/types/request-query.types";
import { JoinOptions } from "@nestjsx/crud";

@Injectable()
export class EcnConnectSchemaSetupLabelsService extends TypeOrmCrudService<EcnConnectSchemaSetupLabel> {
  constructor(
    @InjectRepository(EcnConnectSchemaSetupLabel, AMTS_DB_NAME)
    readonly repo: Repository<EcnConnectSchemaSetupLabel>,
  ) {
    super(repo);
  }

  /**
   * The reason why we do not use usual relations is that we have to join with the same table multiple times. Using
   * standard relations would result in poor performance.
   */
  protected setJoin(cond: QueryJoin, joinOptions: JoinOptions, builder: SelectQueryBuilder<EcnConnectSchemaSetupLabel>) {
    if (cond.field === 'modules.connections') {
      builder.innerJoin('ecn_connect_schema', 'modulesConnections', 'modulesConnections.fromModuleId = modules.id OR modulesConnections.toModuleId = modules.id');
      return false;
    } else if (cond.field === 'modules.connections.subscrSchemas') {
      builder.innerJoin('ecn_subscr_schema', 'modulesConnectionsSubscrSchemas', 'modulesConnectionsSubscrSchemas.connectSchemaId = modulesConnections.id');
      return false;
    }

    return super.setJoin(cond, joinOptions, builder);
  }
}
