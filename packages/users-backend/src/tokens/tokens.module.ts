import { Module, Optional } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { Token } from './entities/token.entity';
import { TokensPermissions } from './tokens.permissions';
import { Action, CaslAbilityFactory } from '../casl';
import { DataSource } from 'typeorm';
import { MyToken } from './policies/manage-my-tokens.policy';
import { MyTokensController } from './my-tokens.controller';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { APP_GUARD } from '@nestjs/core';
import { TokenAuthGuard } from './tokens-auth.guard';
import { TokensAuthStrategy } from './tokens-auth.strategy';
import { isApiTokenCredential } from './tokens.constants';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Module({})
export class TokensModule {
  static forRoot(config: { dataSourceName: string }) {
    return {
      module: TokensModule,
      imports: [TypeOrmModule.forFeature([Token], config.dataSourceName), BcryptModule],
      providers: [
        {
          provide: TokensService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new TokensService(dataSource.getRepository(Token));
          },
        },
      ],
      exports: [TokensService],
      controllers: [TokensController, MyTokensController],
    };
  }

  /**
   * Registers bearer authentication with API tokens.
   *
   * Set `withJwtAuth` when the app also registers JWT authentication (i.e. it
   * imports AuthModule or JwtAuthModule): the two global guards then accept
   * either credential instead of demanding both.
   */
  static forAuth(config: { dataSourceName: string; withJwtAuth?: boolean }) {
    return {
      module: TokensModule,
      imports: [TypeOrmModule.forFeature([Token], config.dataSourceName), BcryptModule],
      providers: [
        {
          provide: TokensService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new TokensService(dataSource.getRepository(Token));
          },
        },
        TokensAuthStrategy,
        // With JWT auth in the same app the token guard is not global: the JWT
        // guard delegates API-token credentials to it (see the constructor), so
        // authentication still happens in one place, ahead of the policies guard
        ...(config.withJwtAuth
          ? [TokenAuthGuard]
          : [{ provide: APP_GUARD, useClass: TokenAuthGuard }]),
      ],
      exports: [],
    };
  }

  constructor(@Optional() tokenAuthGuard?: TokenAuthGuard) {
    // Only provided by forAuth({ withJwtAuth: true })
    if (tokenAuthGuard) {
      JwtAuthGuard.registerAlternativeAuthenticator({
        matches: isApiTokenCredential,
        guard: tokenAuthGuard,
      });
    }

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
