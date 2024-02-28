import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GOOGLE_AUTH } from './auth-strategies.constants';
import { GoogleAuthConfigService } from "./google-auth.config";

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(
  Strategy,
  GOOGLE_AUTH,
) {
  private readonly logger = new Logger(GoogleAuthStrategy.name);

  constructor(
    private authService: AuthService,
    private googleAuthConfigService: GoogleAuthConfigService,
  ) {
    const config = googleAuthConfigService.config;
    super({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { emails: { value: string; verified: boolean }[] },
    callback: VerifyCallback,
  ): Promise<any> {
    try {
      const user = await this.authService.validateUserByEmail(
        profile.emails[0].value,
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
          'Impossible to log in user via google',
        ),
      );
    }
  }
}
