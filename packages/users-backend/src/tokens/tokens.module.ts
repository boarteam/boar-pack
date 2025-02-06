import { Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { Token } from './entities/token.entity';
import { TokensPermissions } from "./tokens.permissions";
import { Action, CaslAbilityFactory } from "../casl";
import { DataSource } from "typeorm";
import { MyToken } from "./policies/manage-my-tokens.policy";
import { MyTokensController } from "./my-tokens.controller";
import { BcryptModule } from "../bcrypt/bcrypt.module";
import { APP_GUARD } from "@nestjs/core";
import { TokenAuthGuard } from "./tokens-auth.guard";
import { TokensAuthStrategy } from "./tokens-auth.strategy";

@Module({})
export class TokensModule {
  static forRoot(config: { dataSourceName: string }) {
    return {
      module: TokensModule,
      imports: [
        TypeOrmModule.forFeature([Token], config.dataSourceName),
        BcryptModule,
      ],
      providers: [
        {
          provide: TokensService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new TokensService(dataSource.getRepository(Token));
          }
        },
      ],
      exports: [
        TokensService,
      ],
      controllers: [
        TokensController,
        MyTokensController,
      ]
    };
  }

  static forAuth(config: { dataSourceName: string }) {
    return {
      module: TokensModule,
      imports: [
        TypeOrmModule.forFeature([Token], config.dataSourceName),
        BcryptModule,
      ],
      providers: [
        {
          provide: TokensService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new TokensService(dataSource.getRepository(Token));
          }
        },
        TokensAuthStrategy,
        {
          provide: APP_GUARD,
          useClass: TokenAuthGuard,
        },
      ],
      exports: [],
    };
  }

  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: TokensPermissions.VIEW,
      action: Action.Read,
      subject: Token,
    });
    CaslAbilityFactory.addPermissionToAction({
      permission: TokensPermissions.MANAGE,
      action: Action.Manage,
      subject: Token,
    });
    CaslAbilityFactory.addPermissionToAction({
      permission: TokensPermissions.MANAGE_MY,
      action: Action.Manage,
      subject: MyToken,
    });
  }
}
