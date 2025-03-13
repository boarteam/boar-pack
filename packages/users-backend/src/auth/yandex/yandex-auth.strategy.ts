import { Strategy } from 'passport-yandex';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { YANDEX_AUTH } from '../auth-strategies.constants';
import { YandexAuthConfigService } from "./yandex-auth.config";
import { TUser } from "../../users";

@Injectable()
export class YandexAuthStrategy extends PassportStrategy(
  Strategy,
  YANDEX_AUTH,
) {
  private readonly logger = new Logger(YandexAuthStrategy.name);

  constructor(
    private authService: AuthService,
    private yandexAuthConfigService: YandexAuthConfigService,
  ) {
    const config = yandexAuthConfigService.config;
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
    callback: (error: Error | null, user?: TUser | null) => void,
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
          'Impossible to log in user via yandex',
        ),
      );
    }
  }
}
