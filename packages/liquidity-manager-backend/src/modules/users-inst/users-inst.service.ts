import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersInst } from './entities/users-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { createHash } from "crypto";
import bcrypt from "bcrypt";

@Injectable()
export class UsersInstService extends TypeOrmCrudService<UsersInst> {
  constructor(
    @InjectRepository(UsersInst, AMTS_DB_NAME)
    readonly repo: Repository<UsersInst>,
  ) {
    super(repo);
  }

  findById(id: string): Promise<UsersInst | null> {
    return this.repo.findOne({
      select: ['id', 'name', 'password', 'pwdHashTypeId'],
      where: { id },
    });
  }

  generateMd5PasswordHash(id: string, password: string): string {
    const hash = createHash('md5');
    hash.update(id + password);
    return hash.digest('hex');
  }

  comparePasswordMd5Hash(id: string, password: string, hash: string): boolean {
    return this.generateMd5PasswordHash(id, password) === hash;
  }

  comparePasswordBcryptHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
