import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogsService extends TypeOrmCrudService<AuditLog> {

  constructor(
    readonly repo: Repository<AuditLog>,
  ) {
    super(repo);
  }
}
