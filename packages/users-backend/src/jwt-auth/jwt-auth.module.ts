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

@Module({
  imports: [
    ConfigModule,
    UsersModule.register({ withControllers: false }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [JwtAuthModule],
      inject: [JWTAuthConfigService],
      useFactory: async (jwtAuthConfigService: JWTAuthConfigService) => ({
        secret: jwtAuthConfigService.config.jwtSecret,
      }),
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
})
export class JwtAuthModule {}
