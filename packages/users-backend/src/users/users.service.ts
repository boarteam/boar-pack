import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
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
