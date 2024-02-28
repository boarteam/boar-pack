import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException, Logger, UnauthorizedException, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MS_AUTH } from './auth-strategies.constants';
import { MSAuthConfigService } from "./ms-auth.config";
import { JWTAuthService } from "../jwt-auth/jwt-auth.service";

// @ts-ignore-next-line There are no types for this package
import { Strategy, VerifyCallback } from 'passport-azure-ad-oauth2';

@Injectable()
export class MSAuthStrategy extends PassportStrategy(
  Strategy,
  MS_AUTH,
) {
  private readonly logger = new Logger(MSAuthStrategy.name);

  constructor(
    private authService: AuthService,
    private msAuthConfigService: MSAuthConfigService,
    private jwtAuthService: JWTAuthService,
  ) {
    const config = msAuthConfigService.config;
    super({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
      tenant: config.tenantId,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    callback: VerifyCallback,
  ): Promise<any> {
    this.logger.debug(`accessToken: ${accessToken}`);
    this.logger.debug(`refreshToken: ${refreshToken}`);
    this.logger.debug(`profile: ${JSON.stringify(profile)}`);
    const token = this.jwtAuthService.decode<{ email?: string, upn?: string }>(accessToken);
    this.logger.debug(`token: ${JSON.stringify(token)}`);
    try {
      const user = await this.authService.validateUserByEmail(
        token.email || token.upn,
      );

      if (!user) {
        callback(new UnauthorizedException('User is not found'));
        return;
      }

      callback(null, user);
    } catch (e) {
      this.logger.error(e, e.stack);
      callback(
        new InternalServerErrorException(
          'Impossible to log in user via ms',
        ),
      );
    }
  }
}
