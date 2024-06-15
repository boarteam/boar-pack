import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EventLog } from './entities/event-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventLogsService extends TypeOrmCrudService<EventLog> {
  constructor(
    readonly repo: Repository<EventLog>,
  ) {
    super(repo);
  }
}
