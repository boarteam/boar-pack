import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringValue } from "ms";

export type TJWTAuthConfig = {
  jwtSecret: string;
  accessTokenExpiration: StringValue;
  refreshTokenExpiration: StringValue;
};

@Injectable()
export class JWTAuthConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TJWTAuthConfig {
    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const accessTokenExpiration = this.configService.get<StringValue>('ACCESS_TOKEN_EXPIRATION', '1h');
    const refreshTokenExpiration = this.configService.get<StringValue>('REFRESH_TOKEN_EXPIRATION', '7d');

    return {
      jwtSecret,
      accessTokenExpiration,
      refreshTokenExpiration,
    };
  }
}
