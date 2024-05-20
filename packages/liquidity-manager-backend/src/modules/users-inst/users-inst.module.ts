import { Module } from '@nestjs/common';
import { UsersInstService } from './users-inst.service';
import { UsersInstController } from './users-inst.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersInst } from './entities/users-inst.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { EcnCommissionType } from "../../entities/ecn-commission-type.entity";
import { GenericLiquidityModule } from "../../tools/generic-liquidity.module";
import { ViewUsersInstPolicy } from "./policies/view-users-inst.policy";
import { EcnCommissionLotsMode } from "../../entities/ecn-commission-lots-mode.entity";

@Module({})
export class UsersInstModule {
  static forRoot() {
    return {
      module: UsersInstModule,
      imports: [
        TypeOrmModule.forFeature([UsersInst], AMTS_DB_NAME),
        GenericLiquidityModule.generate<EcnCommissionType>({
          endpoint: 'liquidity/ecn-commission-types',
          apiTag: 'Ecn Commission Types',
          Entity: EcnCommissionType,
          policy: new ViewUsersInstPolicy,
        }),
        GenericLiquidityModule.generate<EcnCommissionLotsMode>({
          endpoint: 'liquidity/ecn-commission-lots-modes',
          apiTag: 'Ecn Commission Lots Modes',
          Entity: EcnCommissionLotsMode,
          policy: new ViewUsersInstPolicy,
        }),
      ],
      providers: [
        UsersInstService,
      ],
      exports: [
        UsersInstService,
      ],
      controllers: [UsersInstController],
    };
  }

  static forAuth() {
    return {
      module: UsersInstModule,
      imports: [
        TypeOrmModule.forFeature([UsersInst], AMTS_DB_NAME),
      ],
      providers: [
        UsersInstService,
      ],
      exports: [
        UsersInstService,
      ],
      controllers: [],
    };
  }
}
