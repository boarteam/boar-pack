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
    const clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID');
    const tenantId = this.configService.get<string>('MICROSOFT_TENANT_ID');
    const clientSecret = this.configService.get<string>('MICROSOFT_SECRET_ID');
    const callbackURL = this.configService.get<string>('MICROSOFT_CALLBACK_URL');

    if (!clientId) {
      throw new Error('MICROSOFT_CLIENT_ID is not defined');
    }

    if (!tenantId) {
      throw new Error('MICROSOFT_TENANT_ID is not defined');
    }

    if (!clientSecret) {
      throw new Error('MICROSOFT_SECRET_ID is not defined');
    }

    if (!callbackURL) {
      throw new Error('MICROSOFT_CALLBACK_URL is not defined');
    }

    return {
      clientId,
      tenantId,
      clientSecret,
      callbackURL,
    };
  }
}
