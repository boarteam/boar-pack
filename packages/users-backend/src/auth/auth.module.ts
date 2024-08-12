import { DynamicModule, Module } from '@nestjs/common';
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
import AuthManageController from "./auth-manage.controller";

@Module({})
export class AuthModule {
  static forRoot(config: {
    googleAuth: boolean,
    msAuth: boolean,
    localAuth: boolean,
    withControllers: boolean,
    dataSourceName?: string;
  }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: AuthModule,
      imports: [
        ConfigModule,
        UsersModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
        PassportModule,
        JwtAuthModule.register({
          dataSourceName: config.dataSourceName,
        }),
      ],
      providers: [
        AuthService,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
      controllers: [],
      exports: [],
    };

    if (config.googleAuth) {
      dynamicModule.providers!.push(GoogleAuthConfigService, GoogleAuthStrategy);
    }

    if (config.msAuth) {
      dynamicModule.providers!.push(MSAuthConfigService, MSAuthStrategy);
    }

    if (config.localAuth) {
      dynamicModule.providers!.push(LocalAuthStrategy);
    }

    if (config.withControllers) {
      dynamicModule.controllers = [
        AuthController,
        AuthManageController,
      ];
    }

    return dynamicModule;
  }

  static forFeature(config: {
    dataSourceName?: string;
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        ConfigModule,
        UsersModule.register({
          withControllers: false,
          dataSourceName: config.dataSourceName,
        }),
        JwtAuthModule.register({
          dataSourceName: config.dataSourceName,
        }),
      ],
      providers: [
        AuthService,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
      controllers: [],
      exports: [],
    };
  }
}
