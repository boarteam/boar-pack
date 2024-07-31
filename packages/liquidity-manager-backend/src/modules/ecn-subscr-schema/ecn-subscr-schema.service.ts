import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnSubscrSchema } from './entities/ecn-subscr-schema.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class EcnSubscrSchemaService extends TypeOrmCrudService<EcnSubscrSchema> {
  constructor(
    @InjectRepository(EcnSubscrSchema, AMTS_DB_NAME)
    readonly repo: Repository<EcnSubscrSchema>,
    @InjectDataSource(AMTS_DB_NAME)
    readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async updateMany(entitiesToUpdate: Partial<EcnSubscrSchema>[], values: Partial<EcnSubscrSchema>) {
    return this.repo.save(entitiesToUpdate.map(entity => ({ ...entity, ...values })));
  }

  async deleteMany(entitiesToDelete: Partial<EcnSubscrSchema>[]) {
    // @ts-ignore
    return this.repo.remove(entitiesToDelete);
  }
}
