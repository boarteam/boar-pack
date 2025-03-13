import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TMSAuthConfig = {
  clientId: string;
  tenantId: string;
  clientSecret: string;
  callbackURL: string;
};

@Injectable()
export class MSAuthConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TMSAuthConfig {
    const clientId = this.configService.getOrThrow<string>('MICROSOFT_CLIENT_ID');
    const tenantId = this.configService.getOrThrow<string>('MICROSOFT_TENANT_ID');
    const clientSecret = this.configService.getOrThrow<string>('MICROSOFT_SECRET_ID');
    const callbackURL = this.configService.getOrThrow<string>('MICROSOFT_CALLBACK_URL');

    return {
      clientId,
      tenantId,
      clientSecret,
      callbackURL,
    };
  }
}
