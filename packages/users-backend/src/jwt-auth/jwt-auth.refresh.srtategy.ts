import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JWTAuthConfigService } from './jwt-auth.config';
import { Request } from 'express';
import { JWT_AUTH_REFRESH } from '../auth/auth-strategies.constants';
import { refreshTokenName } from "../auth/auth.constants";
import { UsersService } from '../users';
import { RevokedTokensService, TOKEN_TYPE } from '../revoked-tokens';
import { TJWTRefreshPayload } from "./jwt-auth.srtategy";
import ms from "ms";

@Injectable()
export class JwtAuthRefreshStrategy extends PassportStrategy(Strategy, JWT_AUTH_REFRESH) {
  private readonly logger = new Logger(JwtAuthRefreshStrategy.name);

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

          const cookie = cookies.find(c => c.startsWith(`${refreshTokenName}=`));
          if (!cookie) {
            return null;
          }

          return cookie.split('=')[1];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtAuthConfigService.config.jwtSecret,
      passReqToCallback: false,
    });
  }

  async validate(payload: TJWTRefreshPayload) {
    this.logger.debug(`Validating refresh token for user with id: ${payload.sub}`);

    // Check if a token has been revoked
    if (!payload.jti) {
      this.logger.error('Refresh token payload does not contain JTI');
      throw new UnauthorizedException('Invalid token payload');
    }

    const isRevoked = await this.revokedTokensService.isTokenRevoked(payload.jti, payload.sid);
    if (isRevoked) {
      this.logger.debug(`Refresh token with JTI ${payload.jti} has already been revoked`);
      throw new UnauthorizedException('Token has been revoked');
    } else {
      // Refresh token is valid, we revoke it to prevent reuse
      this.logger.debug(`Revoking refresh token with JTI ${payload.jti}`);
      await this.revokedTokensService.revokeRefreshToken({
        jti: payload.jti,
        expiresAt: new Date(
          payload.exp
            ? payload.exp * 1000
            : Date.now() + ms(this.jwtAuthConfigService.config.refreshTokenExpiration)
        ),
        sid: payload.sid || null,
        tokenType: TOKEN_TYPE.REFRESH,
      });
    }

    const userId = payload.sub;
    const user = await this.usersService.findOne({
      select: ['id', 'email', 'role', 'permissions'],
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
