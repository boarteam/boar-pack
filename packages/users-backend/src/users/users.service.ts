import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(readonly repo: Repository<User>) {
    super(repo);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: Partial<User>): Promise<User> {
    // findByEmail looks up lowercased addresses, so a mixed-case email stored
    // as given would be unreachable. The DTOs normalize at the controller
    // boundary; this covers direct service calls (seeding, other modules).
    const user = this.repo.create(data.email ? { ...data, email: data.email.toLowerCase() } : data);
    await this.repo.save(user);
    return user;
  }
}
