import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { UsersConnectionsHistory } from "./entities/users-connections-history.entity";
import { TypeOrmCrudService } from "@dataui/crud-typeorm";


@Injectable()
export class UsersConnectionsHistoryService extends TypeOrmCrudService<UsersConnectionsHistory> {
  private readonly logger = new Logger(UsersConnectionsHistoryService.name);

  constructor(
    readonly repo: Repository<UsersConnectionsHistory>,
  ) {
    super(repo);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async deleteOldUsersConnectionsHistory() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(UsersConnectionsHistory)
      .where('created_at <= :oneYearAgo', { oneYearAgo })
      .execute();

    this.logger.debug(`Removed ${result.affected} expired records from users_connections_history table.`);
  }
}
