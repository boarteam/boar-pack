import { DynamicModule, Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityManagersUsersService } from './liquidity-managers-users.service';
import { LiquidityManagersUsersController } from './liquidity-managers-users.controller';
import {
  LIQUIDITY_MANAGER_USER_UNIQUE_CONSTRAINT,
  LiquidityManagersUser
} from './entities/liquidity-managers-user.entity';
import { Tools } from '@jifeon/boar-pack-common-backend';

@Module({})
export class LiquidityManagersUsersModule {
  static forTID(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersUsersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManagersUser], config.dataSourceName),
      ],
      providers: [
        {
          provide: LiquidityManagersUsersService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource) => {
            return new LiquidityManagersUsersService(dataSource.getRepository(LiquidityManagersUser));
          }
        },
      ],
      exports: [
        LiquidityManagersUsersService,
      ],
      controllers: [
        LiquidityManagersUsersController,
      ],
    };
  }

  static forFeature(config: {
    dataSourceName: string;
  }): DynamicModule {
    return {
      module: LiquidityManagersUsersModule,
      imports: [
        TypeOrmModule.forFeature([LiquidityManagersUser], config.dataSourceName),
      ],
      providers: [
        {
          provide: LiquidityManagersUsersService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource) => {
            return new LiquidityManagersUsersService(dataSource.getRepository(LiquidityManagersUser));
          }
        },
      ],
      exports: [
        LiquidityManagersUsersService,
      ],
      controllers: [],
    };
  }

  constructor() {
    Tools.TypeOrmExceptionFilter.setUniqueConstraintMessage(
      LIQUIDITY_MANAGER_USER_UNIQUE_CONSTRAINT,
      'The user already exists for this liquidity manager.'
    );
  }
}
