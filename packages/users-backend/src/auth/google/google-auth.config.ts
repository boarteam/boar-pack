import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TGoogleAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
};

@Injectable()
export class GoogleAuthConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TGoogleAuthConfig {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_SECRET_ID');
    const callbackURL = this.configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not defined');
    }

    if (!clientSecret) {
      throw new Error('GOOGLE_SECRET_ID is not defined');
    }

    if (!callbackURL) {
      throw new Error('GOOGLE_CALLBACK_URL is not defined');
    }

    return {
      clientId,
      clientSecret,
      callbackURL,
    };
  }
}
