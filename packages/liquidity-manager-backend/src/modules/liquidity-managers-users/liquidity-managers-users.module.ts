import { DynamicModule, Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityManagersUsersService } from './liquidity-managers-users.service';
import { LiquidityManagersUsersController } from './liquidity-managers-users.controller';
import { LiquidityManagersUser } from './entities/liquidity-managers-user.entity';

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
}
