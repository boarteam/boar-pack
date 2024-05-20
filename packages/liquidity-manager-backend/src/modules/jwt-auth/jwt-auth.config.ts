import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TJWTAuthConfig = {
  jwtSecret: string;
};

@Injectable()
export class JWTAuthConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TJWTAuthConfig {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return {
      jwtSecret,
    };
  }
}
