import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from './jwt-auth.srtategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthConfigService } from "./jwt-auth.config";
import { PassportModule } from "@nestjs/passport";
import { JWTAuthService } from "./jwt-auth.service";
import { RevokedTokensModule } from '../revoked-tokens';

@Module({})
export class JwtAuthModule {
  static register(config: {
    dataSourceName?: string;
  }) {
    return {
      module: JwtAuthModule,
      imports: [
        ConfigModule,
        UsersModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [JwtAuthModule.forConfig()],
          inject: [JWTAuthConfigService],
          useFactory: async (jwtAuthConfigService: JWTAuthConfigService) => ({
            secret: jwtAuthConfigService.config.jwtSecret,
          }),
        }),
        RevokedTokensModule.register({
          dataSourceName: config.dataSourceName,
        }),
      ],
      providers: [
        JWTAuthConfigService,
        JwtAuthStrategy,
        JWTAuthService,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
      exports: [
        JWTAuthConfigService,
        JWTAuthService,
      ],
    };
  }

  private static forConfig() {
    return {
      module: JwtAuthModule,
      imports: [ConfigModule],
      providers: [JWTAuthConfigService],
      exports: [JWTAuthConfigService],
    };
  }
}
