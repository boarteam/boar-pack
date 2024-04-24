import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { SubloginSettings } from './entities/sublogin-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class SubloginsSettingsService extends TypeOrmCrudService<SubloginSettings> {
  constructor(
    @InjectRepository(SubloginSettings, TP_DB_NAME)
    readonly repo: Repository<SubloginSettings>,
  ) {
    super(repo);
  }
}
