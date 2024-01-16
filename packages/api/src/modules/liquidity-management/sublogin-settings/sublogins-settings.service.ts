import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { SubloginSettings } from './entities/sublogin-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Injectable()
export class SubloginsSettingsService extends TypeOrmCrudService<SubloginSettings> {
  constructor(
    @InjectRepository(SubloginSettings, AMTS_DB_NAME)
    readonly repo: Repository<SubloginSettings>,
  ) {
    super(repo);
  }
}
