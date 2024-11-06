import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { Repository } from "typeorm";
import { CrudRequestOptions } from '@nestjsx/crud';
import { ParsedRequestParams } from '@nestjsx/crud-request';
import { updateBuilderSort } from '../../tools/instrumentSort';

@Injectable()
export class ViewInstrumentsSpecificationsService extends TypeOrmCrudService<ViewInstrumentsSpecification> {
  constructor(
    @InjectRepository(ViewInstrumentsSpecification, AMTS_DB_NAME)
    readonly repo: Repository<ViewInstrumentsSpecification>,
  ) {
    super(repo);
  }

  public async createBuilder(parsed: ParsedRequestParams, options: CrudRequestOptions, many: boolean = true, withDeleted: boolean = true) {
    const builder = await super.createBuilder(parsed, options, many, withDeleted);
    return updateBuilderSort<ViewInstrumentsSpecification>(builder, many, 'ViewInstrumentsSpecification.instrument', '`ViewInstrumentsSpecification`.`instrument`');
  }
}
