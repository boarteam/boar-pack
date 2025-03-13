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
    const clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>('GOOGLE_SECRET_ID');
    const callbackURL = this.configService.getOrThrow<string>('GOOGLE_CALLBACK_URL');

    return {
      clientId,
      clientSecret,
      callbackURL,
    };
  }
}
