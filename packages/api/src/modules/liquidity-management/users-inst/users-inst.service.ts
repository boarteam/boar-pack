import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersInst } from './entities/users-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Injectable()
export class UsersInstService extends TypeOrmCrudService<UsersInst> {
  constructor(
    @InjectRepository(UsersInst, AMTS_DB_NAME)
    readonly repo: Repository<UsersInst>,
  ) {
    super(repo);
  }
}
