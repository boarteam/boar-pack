import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { SubloginSettings } from './entities/sublogin-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { ParsedRequestParams } from "@nestjsx/crud-request";
import { CrudRequestOptions } from "@nestjsx/crud";

@Injectable()
export class SubloginsSettingsService extends TypeOrmCrudService<SubloginSettings> {
  constructor(
    @InjectRepository(SubloginSettings, AMTS_DB_NAME)
    readonly repo: Repository<SubloginSettings>,
  ) {
    super(repo);
  }

  public async createBuilder(parsed: ParsedRequestParams, options: CrudRequestOptions, many: boolean = true, withDeleted: boolean = true) {
    const builder = await super.createBuilder(parsed, options, many, withDeleted);

    if (!many) {
      return builder;
    }

    const orderBys = builder.expressionMap.orderBys;
    const direction = orderBys['instrumentRel.name'] ?? 'ASC';

    builder.addSelect(`
      CASE 
        WHEN "SubloginSettings_instrument" LIKE "[%" THEN 1 
        WHEN "SubloginSettings_instrument" LIKE "@%" THEN 2 
        WHEN "SubloginSettings_instrument" LIKE "#%" THEN 3 
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
