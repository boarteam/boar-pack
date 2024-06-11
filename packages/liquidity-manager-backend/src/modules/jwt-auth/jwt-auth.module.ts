import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from './jwt-auth.srtategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthConfigService } from "./jwt-auth.config";
import { PassportModule } from "@nestjs/passport";
import { JWTAuthService } from "./jwt-auth.service";
import { UsersInstModule } from "../users-inst/users-inst.module";
import { JwtUriAuthStrategy } from "./jwt-uri-auth.srtategy";

@Module({})
export class JwtAuthModule {
  static forRoot() {
    return {
      module: JwtAuthModule,
      imports: [
        ConfigModule,
        UsersInstModule.forAuth(),
        PassportModule,
        JwtModule.registerAsync({
          imports: [JwtAuthModule.forConfig()],
          inject: [JWTAuthConfigService],
          useFactory: async (jwtAuthConfigService: JWTAuthConfigService) => ({
            secret: jwtAuthConfigService.config.jwtSecret,
            signOptions: {
              expiresIn: '1h',
            }
          }),
        }),
      ],
      providers: [
        JWTAuthConfigService,
        JwtAuthStrategy,
        JWTAuthService,
        JwtUriAuthStrategy,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
      exports: [
        JWTAuthConfigService,
        JWTAuthService,
      ],
    }
  }

  static forConfig() {
    return {
      module: JwtAuthModule,
      imports: [ConfigModule],
      providers: [JWTAuthConfigService],
      exports: [JWTAuthConfigService],
    };
  }
}
