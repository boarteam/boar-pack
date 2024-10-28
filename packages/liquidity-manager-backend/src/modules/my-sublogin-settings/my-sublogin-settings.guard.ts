import { TUser } from '@jifeon/boar-pack-users-backend';
import { CanActivate, ExecutionContext, Injectable, Logger, } from '@nestjs/common';
import { Request } from 'express';
import { UsersSubAccountsInstService } from '../users-sub-accounts-inst/users-sub-accounts-inst.service';

@Injectable()
export class MySubloginSettingsGuard implements CanActivate {
  private readonly logger = new Logger(MySubloginSettingsGuard.name);

  constructor(
    private readonly usersSubAccountsInstService: UsersSubAccountsInstService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as TUser;

    const usersSubAccountInstId = request.params['usersSubAccountInstId'];
    const belongsToUser = await this.usersSubAccountsInstService.belongsToUser(usersSubAccountInstId, user.id);

    if (!belongsToUser) {
      this.logger.warn(`User ${user.id} tried to activate SubloginSettings with SubAccount ${usersSubAccountInstId} that does not belong to him`);
    }

    return belongsToUser;
  }
}
