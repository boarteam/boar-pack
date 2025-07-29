import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TAuthConfig = {
  refreshTokenPath: string;
};

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TAuthConfig {
    const refreshTokenPath = this.configService.get<string>('REFRESH_TOKEN_PATH', '/api/auth/refresh');

    return {
      refreshTokenPath,
    };
  }
}
