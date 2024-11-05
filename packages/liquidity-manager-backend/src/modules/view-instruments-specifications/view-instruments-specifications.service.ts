import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { Repository } from "typeorm";
import { CrudRequestOptions } from '@nestjsx/crud';
import { ParsedRequestParams } from '@nestjsx/crud-request';

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

    if (!many) {
      return builder;
    }

    const orderBys = builder.expressionMap.orderBys;
    const direction = orderBys['ViewInstrumentsSpecification.instrument'] ?? 'ASC';

    builder.addSelect(`
      CASE 
        WHEN "ViewInstrumentsSpecification_instrument" LIKE "[%" THEN 1 
        WHEN "ViewInstrumentsSpecification_instrument" LIKE "@%" THEN 2 
        WHEN "ViewInstrumentsSpecification_instrument" LIKE "#%" THEN 3 
        ELSE 4 
      END
    `, 'custom_order');

    // We do not use addOrderBy because it does not allow to set object literal. So this won't work:
    // builder.orderBy(our case);
    // builder.addOrderBy(parsed, options.query);
    // So we have to set it directly.
    builder.expressionMap.orderBys = {
      ['custom_order']: direction,
      ...orderBys,
    };
    return builder;
  }
}
