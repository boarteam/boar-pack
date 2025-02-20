import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { getAction } from "@dataui/crud";
import { isEqual } from 'lodash';

@Injectable()
export class UsersEditingGuard implements CanActivate {
  private readonly logger = new Logger(UsersEditingGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      this.logger.warn(`User not found in users editing guard`);
      throw new InternalServerErrorException(`User not found in users editing guard`);
    }

    const editingUserId = request.params['id'];
    switch (getAction(context.getHandler())) {
      case 'Update-One':
        if (editingUserId === user.id) {
          const newRole = request.body['role'];
          if (newRole !== user.role && newRole !== undefined) {
            this.logger.warn(`User can't change his role`);
            throw new ForbiddenException(`User can't change his role`);
          }

          const newEmail = request.body['email'];
          if (newEmail !== user.email && newEmail !== undefined) {
            this.logger.warn(`User can't change his email`);
            throw new ForbiddenException(`User can't change his email`);
          }

          const newPermissions = request.body['permissions'];
          if (!isEqual(newPermissions, user.permissions) && newPermissions !== undefined) {
            this.logger.warn(`User can't change his permissions`);
            throw new ForbiddenException(`User can't change his permissions`);
          }
        }
        break;

      case 'Delete-One':
        if (editingUserId === user.id) {
          this.logger.warn(`User can't delete himself`);
          throw new ForbiddenException(`User can't delete himself`);
        }
        break;
    }

    return true;
  }
}
