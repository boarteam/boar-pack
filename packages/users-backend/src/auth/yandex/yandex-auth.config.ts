import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TYandexAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
};

@Injectable()
export class YandexAuthConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TYandexAuthConfig {
    const clientId = this.configService.getOrThrow<string>('YANDEX_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>('YANDEX_SECRET_ID');
    const callbackURL = this.configService.getOrThrow<string>('YANDEX_CALLBACK_URL');

    return {
      clientId,
      clientSecret,
      callbackURL,
    };
  }
}
