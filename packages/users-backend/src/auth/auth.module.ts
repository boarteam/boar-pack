import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalAuthStrategy } from './local-auth.strategy';
import { PassportModule } from '@nestjs/passport';
import AuthController from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthStrategy } from './google-auth.strategy';
import { GoogleAuthConfigService } from "./google-auth.config";
import { MSAuthStrategy } from './ms-auth.strategy';
import { MSAuthConfigService } from "./ms-auth.config";
import { JwtAuthModule } from "../jwt-auth/jwt-auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../jwt-auth/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule,
    UsersModule.register(),
    PassportModule,
    JwtAuthModule,
  ],
  providers: [
    AuthService,
    GoogleAuthConfigService,
    MSAuthConfigService,
    LocalAuthStrategy,
    GoogleAuthStrategy,
    MSAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
