import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JWT_AUTH } from '../auth/auth-strategies.constants';

export const SKIP_JWT_GUARD = 'skipJWTGuard';
export const SkipJWTGuard = () => SetMetadata<string, boolean>(SKIP_JWT_GUARD, true);

export type TAlternativeAuthenticator = {
  /** Recognizes the bearer credentials owned by the alternative mechanism. */
  matches: (credential: string) => boolean;
  guard: CanActivate;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_AUTH) {
  private static alternativeAuthenticators: TAlternativeAuthenticator[] = [];

  /**
   * Lets another authentication mechanism (API tokens, for instance) handle the
   * credentials it owns. Its guard runs in place of this one, which keeps a
   * single global authentication guard in front of the authorization guard —
   * registering a second global auth guard instead would make the two demand
   * their own credential simultaneously, and would run after the policies guard.
   */
  static registerAlternativeAuthenticator(authenticator: TAlternativeAuthenticator): void {
    if (!this.alternativeAuthenticators.includes(authenticator)) {
      this.alternativeAuthenticators.push(authenticator);
    }
  }

  static clearAlternativeAuthenticators(): void {
    this.alternativeAuthenticators = [];
  }

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(SKIP_JWT_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipGuard) {
      return true;
    }

    if (JwtAuthGuard.alternativeAuthenticators.length) {
      const request = context.switchToHttp().getRequest();
      const [scheme, credential] = request?.headers?.authorization?.split(' ') ?? [];
      if (scheme?.toLowerCase() === 'bearer' && credential) {
        const alternative = JwtAuthGuard.alternativeAuthenticators.find(({ matches }) =>
          matches(credential),
        );
        if (alternative) {
          return alternative.guard.canActivate(context);
        }
      }
    }

    return super.canActivate(context);
  }
}
