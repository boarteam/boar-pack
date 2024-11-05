import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { Repository } from "typeorm";
import { QueryOptions } from '@nestjsx/crud';
import { ParsedRequestParams } from '@nestjsx/crud-request';
import { getCustomInstrumentSort } from '../../tools/instrumentSort';

@Injectable()
export class ViewInstrumentsSpecificationsService extends TypeOrmCrudService<ViewInstrumentsSpecification> {
  constructor(
    @InjectRepository(ViewInstrumentsSpecification, AMTS_DB_NAME)
    readonly repo: Repository<ViewInstrumentsSpecification>,
  ) {
    super(repo);
  }

  protected getSort(query: ParsedRequestParams, options: QueryOptions) {
    const originalSort = super.getSort(query, options);
    return getCustomInstrumentSort(originalSort, `${this.repo.metadata.name}.instrument`);
  }
}
