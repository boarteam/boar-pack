import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JWTAuthConfigService } from './jwt-auth.config';
import { Request } from 'express';
import { JWT_AUTH } from '../auth/auth-strategies.constants';
import { tokenName } from '../auth/auth.constants';
import { UsersService } from '../users';
import { RevokedTokensService, TOKEN_TYPE } from '../revoked-tokens';

export type TJWTPayload = {
  email: string;
  sub: string;
  iat?: string; // Issued At
  exp?: number; // Expiration Time
  jti?: string; // JWT ID, used for revocation
  sid?: string; // Session ID to identify the family of tokens
  type?: TOKEN_TYPE; // Set when signing; access and refresh tokens are not interchangeable
};

export type TJWTRefreshPayload = {
  sub: string; // User ID
  jti?: string; // JWT ID, used for revocation
  iat?: number; // Issued At
  exp?: number; // Expiration Time
  sid?: string; // Session ID to identify the family of tokens
  type?: TOKEN_TYPE; // Set when signing; access and refresh tokens are not interchangeable
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, JWT_AUTH) {
  private readonly logger = new Logger(JwtAuthStrategy.name);
  constructor(
    private usersService: UsersService,
    private jwtAuthConfigService: JWTAuthConfigService,
    private revokedTokensService: RevokedTokensService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          const cookies = req.headers.cookie?.split('; ');
          if (!cookies) {
            return null;
          }

          const cookie = cookies.find((c) => c.startsWith(`${tokenName}=`));
          if (!cookie) {
            return null;
          }

          return cookie.split('=')[1];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtAuthConfigService.config.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TJWTPayload) {
    this.logger.debug(`Validating user with email: ${payload.email}`);

    // Refresh tokens are signed with the same secret, so without this check they
    // would be accepted as access tokens
    if (payload.type !== TOKEN_TYPE.ACCESS) {
      this.logger.debug(`Rejecting token of type "${payload.type}" used as an access token`);
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if a token has been revoked
    if (payload.jti) {
      const isRevoked = await this.revokedTokensService.isTokenRevoked(payload.jti, payload.sid);
      if (isRevoked) {
        this.logger.debug(`Token with JTI ${payload.jti} has been revoked`);
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    const userId = payload.sub;
    const user = await this.usersService.findOne({
      select: ['id', 'email', 'role', 'permissions'],
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    req.jwt = payload; // Attach JWT payload to the request for further use

    return user;
  }
}
