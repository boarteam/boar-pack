import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TID_DB_NAME } from "../app/tid-typeorm.config";

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User, TID_DB_NAME)
    readonly repo: Repository<User>,
  ) {
    super(repo);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    await this.repo.save(user);
    return user;
  }
}
