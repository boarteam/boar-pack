import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnModule } from './entities/ecn-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { QueryJoin } from "@nestjsx/crud-request/lib/types/request-query.types";
import { JoinOptions } from "@nestjsx/crud";

@Injectable()
export class EcnModulesService extends TypeOrmCrudService<EcnModule> {
  constructor(
    @InjectRepository(EcnModule, AMTS_DB_NAME)
    readonly repo: Repository<EcnModule>,
  ) {
    super(repo);
  }

  /**
   * The reason why we do not use usual relations is that we have to join with the same table multiple times. Using
   * standard relations would result in poor performance.
   */
  protected setJoin(cond: QueryJoin, joinOptions: JoinOptions, builder: SelectQueryBuilder<EcnModule>) {
    if (cond.field === 'connections') {
      builder.innerJoin('ecn_connect_schema', 'connections', 'connections.fromModuleId = EcnModule.id OR connections.toModuleId = EcnModule.id');
      return false;
    } else if (cond.field === 'connections.subscrSchemas') {
      builder.innerJoin('ecn_subscr_schema', 'connectionsSubscrSchemas', 'connectionsSubscrSchemas.connectSchemaId = connections.id');
      return false;
    }

    return super.setJoin(cond, joinOptions, builder);
  }
}
