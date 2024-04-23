import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersGroupsInst } from './entities/users-groups-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app.config";

@Injectable()
export class UsersGroupsInstService extends TypeOrmCrudService<UsersGroupsInst> {
  constructor(
    @InjectRepository(UsersGroupsInst, AMTS_DB_NAME)
    readonly repo: Repository<UsersGroupsInst>,
  ) {
    super(repo);
  }
}
