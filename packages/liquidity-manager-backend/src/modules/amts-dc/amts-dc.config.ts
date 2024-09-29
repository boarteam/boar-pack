import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TAmtsDcConfig = {
  webApiLogin: string;
  webApiPass: string;
  httpBaseUrl: string;
  wsBaseUrl: string;
};

@Injectable()
export class AmtsDcConfigService {
  constructor(private configService: ConfigService) {}

  get config(): TAmtsDcConfig {
    const webApiLogin = this.configService.getOrThrow<string>('WEB_API_LOGIN');
    const webApiPass = this.configService.getOrThrow<string>('WEB_API_PASS');
    const httpBaseUrl = this.configService.getOrThrow<string>('WEB_API_HTTP_BASE_URL');
    const wsBaseUrl = this.configService.getOrThrow<string>('WEB_API_WS_BASE_URL');

    return {
      webApiLogin,
      webApiPass,
      httpBaseUrl,
      wsBaseUrl,
    };
  }
}
