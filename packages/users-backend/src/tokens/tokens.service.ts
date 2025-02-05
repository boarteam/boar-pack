import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokensService extends TypeOrmCrudService<Token> {

  constructor(
    readonly repo: Repository<Token>,
  ) {
    super(repo);
  }
}
