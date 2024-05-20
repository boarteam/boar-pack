import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthStrategy } from './local-auth.strategy';
import { PassportModule } from '@nestjs/passport';
import AuthController from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard, JwtAuthModule } from "../jwt-auth";
import { APP_GUARD } from "@nestjs/core";
import { UsersInstModule } from '../users-inst/users-inst.module';

@Module({
  imports: [
    ConfigModule,
    UsersInstModule.forAuth(),
    PassportModule,
    JwtAuthModule.forRoot(),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    LocalAuthStrategy,
  ],
  controllers: [
    AuthController
  ],
  exports: [],
})
export class AuthModule {
}
