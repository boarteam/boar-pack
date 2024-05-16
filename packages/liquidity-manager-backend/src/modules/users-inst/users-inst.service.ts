import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersInst } from './entities/users-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { createHash } from "crypto";

@Injectable()
export class UsersInstService extends TypeOrmCrudService<UsersInst> {
  constructor(
    @InjectRepository(UsersInst, AMTS_DB_NAME)
    readonly repo: Repository<UsersInst>,
  ) {
    super(repo);
  }

  findByName(name: string): Promise<UsersInst | null> {
    return this.repo.findOne({ where: { name } });
  }

  generatePasswordHash(name: string, password: string): string {
    const hash = createHash('md5');
    hash.update(name + password);
    return hash.digest('hex');
  }

  comparePasswordHash(name: string, password: string, hash: string): boolean {
    return this.generatePasswordHash(name, password) === hash;
  }
}
