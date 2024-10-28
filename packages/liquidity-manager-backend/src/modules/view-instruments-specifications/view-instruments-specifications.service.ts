import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { TP_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { Repository } from "typeorm";

@Injectable()
export class ViewInstrumentsSpecificationsService extends TypeOrmCrudService<ViewInstrumentsSpecification> {
  constructor(
    @InjectRepository(ViewInstrumentsSpecification, TP_DB_NAME)
    readonly repo: Repository<ViewInstrumentsSpecification>,
  ) {
    super(repo);
  }
}
