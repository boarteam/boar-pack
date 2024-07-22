import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { LiquidityManagersUser } from './entities/liquidity-managers-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LiquidityManagersUsersService extends TypeOrmCrudService<LiquidityManagersUser> {
  constructor(
    readonly repo: Repository<LiquidityManagersUser>,
  ) {
    super(repo);
  }
}
