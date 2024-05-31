import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JWT_AUTH } from '../auth/auth-strategies.constants';

export const SKIP_JWT_GUARD = 'skipJWTGuard';
export const SkipJWTGuard = () =>
  SetMetadata<string, boolean>(SKIP_JWT_GUARD, true);

console.log('JWT_AUTH:', JWT_AUTH);

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_AUTH) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_JWT_GUARD,
      [context.getHandler(), context.getClass()],
    );
    if (skipGuard) {
      return true;
    }
    return super.canActivate(context);
  }
}
