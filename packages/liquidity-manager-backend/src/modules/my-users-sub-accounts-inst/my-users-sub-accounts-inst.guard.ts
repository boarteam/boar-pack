import { TUser } from '@jifeon/boar-pack-users-backend';
import { CanActivate, ExecutionContext, Injectable, Logger, } from '@nestjs/common';
import { Request } from 'express';
import { UsersSubAccountsInstService } from '../users-sub-accounts-inst/users-sub-accounts-inst.service';

@Injectable()
export class MyUsersSubAccountsInstGuard implements CanActivate {
  private readonly logger = new Logger(MyUsersSubAccountsInstGuard.name);

  constructor(
    private readonly usersSubAccountsInstService: UsersSubAccountsInstService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as TUser;

    const userSubAccountInstId = request.params['id'];
    if (!userSubAccountInstId) {
      this.logger.warn(`User ${user.id} tried to activate SubAccount without providing subAccountId`);
      return false;
    }

    const belongsToUser = await this.usersSubAccountsInstService.belongsToUser(userSubAccountInstId, user.id);

    if (!belongsToUser) {
      this.logger.warn(`User ${user.id} tried to activate SubAccount ${userSubAccountInstId} that does not belong to him`);
    }

    return belongsToUser;
  }
}
