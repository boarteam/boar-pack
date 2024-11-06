import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { SubloginSettings } from './entities/sublogin-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { ParsedRequestParams } from "@nestjsx/crud-request";
import { CrudRequestOptions } from "@nestjsx/crud";
import { updateBuilderSort } from '../../tools/instrumentSort';

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
    return updateBuilderSort<SubloginSettings>(builder, many, 'instrumentRel.name', '`instrumentGroup`.`name`');
  }
}
