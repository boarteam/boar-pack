import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JWTAuthConfigService } from './jwt-auth.config';
import { Request } from 'express';
import { JWT_AUTH, tokenName } from '../auth';
import { UsersService } from '../users';
import { RevokedTokensService } from '../revoked-tokens';

export type TJWTPayload = {
  email: string;
  sub: string;
  iat?: string; // Issued At
  exp?: number; // Expiration Time
  jti?: string; // JWT ID, used for revocation
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

          const cookie = cookies.find(c => c.startsWith(`${tokenName}=`));
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

    // Check if a token has been revoked
    if (payload.jti) {
      const isRevoked = await this.revokedTokensService.isTokenRevoked(payload.jti);
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
