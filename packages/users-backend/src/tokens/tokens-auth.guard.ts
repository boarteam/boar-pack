import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { TOKENS_AUTH } from './tokens.constants';

export const SKIP_TOKEN_AUTH_GUARD = 'skipTokenAuthGuard';
export const SkipTokenAuthGuard = () => SetMetadata<string, boolean>(SKIP_TOKEN_AUTH_GUARD, true);

@Injectable()
export class TokenAuthGuard extends AuthGuard(TOKENS_AUTH) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(SKIP_TOKEN_AUTH_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipGuard) {
      return true;
    }

    return super.canActivate(context);
  }
}
