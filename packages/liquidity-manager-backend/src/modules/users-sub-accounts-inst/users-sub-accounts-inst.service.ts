import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersSubAccountInst } from './entities/users-sub-account-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class UsersSubAccountsInstService extends TypeOrmCrudService<UsersSubAccountInst> {
  constructor(
    @InjectRepository(UsersSubAccountInst, AMTS_DB_NAME)
    readonly repo: Repository<UsersSubAccountInst>,
  ) {
    super(repo);
  }
}
