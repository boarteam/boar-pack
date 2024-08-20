import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TTpDcConfig = {
  webApiLogin: string;
  webApiPass: string;
};

@Injectable()
export class TpDcConfigService {
  constructor(private configService: ConfigService) {}

  get config(): TTpDcConfig {
    const webApiLogin = this.configService.getOrThrow<string>('WEB_API_LOGIN');
    const webApiPass = this.configService.getOrThrow<string>('WEB_API_PASS');

    return {
      webApiLogin,
      webApiPass,
    };
  }
}
