import { DynamicModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalAuthStrategy } from './local-auth/local-auth.strategy';
import { PassportModule } from '@nestjs/passport';
import AuthController from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthStrategy } from './google/google-auth.strategy';
import { GoogleAuthConfigService } from "./google/google-auth.config";
import { MSAuthStrategy } from './microsoft/ms-auth.strategy';
import { MSAuthConfigService } from "./microsoft/ms-auth.config";
import { JwtAuthModule } from "../jwt-auth/jwt-auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../jwt-auth/jwt-auth.guard";
import AuthManageController from "./auth-manage.controller";
import GoogleAuthController from "./google/google-auth.controller";
import MsAuthController from "./microsoft/ms-auth.controller";
import LocalAuthController from "./local-auth/local-auth.controller";
import { YandexAuthStrategy } from "./yandex/yandex-auth.strategy";
import { YandexAuthConfigService } from "./yandex/yandex-auth.config";
import YandexAuthController from "./yandex/yandex-auth.controller";
import { AuthConfigService } from "./auth.config";

@Module({})
export class AuthModule {
  static forRoot(config: {
    googleAuth?: boolean,
    msAuth?: boolean,
    yandexAuth?: boolean,
    localAuth?: boolean,
    withControllers?: boolean,
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
        AuthConfigService,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
      controllers: [],
      exports: [],
    };

    const controllers = [];
    if (config.googleAuth) {
      dynamicModule.providers!.push(GoogleAuthConfigService, GoogleAuthStrategy);
      controllers.push(GoogleAuthController);
    }

    if (config.msAuth) {
      dynamicModule.providers!.push(MSAuthConfigService, MSAuthStrategy);
      controllers.push(MsAuthController);
    }

    if (config.yandexAuth) {
      dynamicModule.providers!.push(YandexAuthConfigService, YandexAuthStrategy);
      controllers.push(YandexAuthController);
    }

    if (config.localAuth) {
      dynamicModule.providers!.push(LocalAuthStrategy);
      controllers.push(LocalAuthController);
    }

    if (config.withControllers) {
      dynamicModule.controllers = [
        ...controllers,
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
        AuthConfigService,
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
