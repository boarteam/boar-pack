import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersSubAccountInst } from './entities/users-sub-account-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TP_DB_NAME } from "../../tp-db/tp-db.config";

@Injectable()
export class UsersSubAccountsInstService extends TypeOrmCrudService<UsersSubAccountInst> {
  constructor(
    @InjectRepository(UsersSubAccountInst, TP_DB_NAME)
    readonly repo: Repository<UsersSubAccountInst>,
  ) {
    super(repo);
  }
}
