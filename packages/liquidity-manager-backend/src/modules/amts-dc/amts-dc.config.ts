import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TAmtsDcConfig = {
  webApiLogin: string;
  webApiPass: string;
};

@Injectable()
export class AmtsDcConfigService {
  constructor(private configService: ConfigService) {}

  get config(): TAmtsDcConfig {
    const webApiLogin = this.configService.getOrThrow<string>('WEB_API_LOGIN');
    const webApiPass = this.configService.getOrThrow<string>('WEB_API_PASS');

    return {
      webApiLogin,
      webApiPass,
    };
  }
}
