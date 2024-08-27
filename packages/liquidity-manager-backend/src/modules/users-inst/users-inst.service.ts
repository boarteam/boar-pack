import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UsersInst } from './entities/users-inst.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { EcnPasswordHashType } from "./users-inst.constants";

export type TGenPasswordParams = Pick<UsersInst, 'id' | 'password' | 'pwdHashTypeId'>;
export type TUpdatePasswordParams = Pick<UsersInst, 'id' | 'password' | 'salt'>;

@Injectable()
export class UsersInstService extends TypeOrmCrudService<UsersInst> {
  private readonly logger = new Logger(UsersInstService.name);

  constructor(
    @InjectRepository(UsersInst, AMTS_DB_NAME)
    readonly repo: Repository<UsersInst>,
  ) {
    super(repo);
  }

  public findById(id: string): Promise<UsersInst | null> {
    return this.repo.findOne({
      select: ['id', 'name', 'password', 'pwdHashTypeId'],
      where: { id },
    });
  }

  public generateMd5PasswordHash(id: string, password: string): string {
    const hash = createHash('md5');
    hash.update(id + password);
    return hash.digest('hex');
  }

  public comparePasswordMd5Hash(id: string, password: string, hash: string): boolean {
    return this.generateMd5PasswordHash(id, password) === hash;
  }

  public comparePasswordBcryptHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public async generatePassword(params: TGenPasswordParams): Promise<TUpdatePasswordParams> {
    if (params.pwdHashTypeId === EcnPasswordHashType.MD5) {
      this.logger.debug('Generating MD5 password hash');
      return {
        id: params.id,
        password: this.generateMd5PasswordHash(params.id, params.password),
      };
    } else if (params.pwdHashTypeId === EcnPasswordHashType.BCRYPT) {
      this.logger.debug('Generating bcrypt password hash');
      const salt = await bcrypt.genSalt();
      return {
        id: params.id,
        password: await bcrypt.hash(params.password, salt),
        salt,
      };
    } else {
      throw new Error('Unknown password hash type');
    }
  }

  public async updatePassword(params: TUpdatePasswordParams): Promise<void> {
    await this.repo.save({
      id: params.id,
      password: params.password,
      salt: params.salt,
    });
  }

  async getMarginModuleId(userId: number): Promise<UsersInst['marginModuleId']> {
    const user = await this.repo.findOne({
      select: ['marginModuleId'],
      where: { id: String(userId) },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user.marginModuleId;
  }
}
