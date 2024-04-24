import { Module } from '@nestjs/common';
import { UsersGroupsInstService } from './users-groups-inst.service';
import { UsersGroupsInstController } from './users-groups-inst.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersGroupsInst } from './entities/users-groups-inst.entity';
import { DclAction } from "../../entities/dcl-action.entity";
import { GenericLiquidityModule } from "../../tools/generic-liquidity.module";
import { ViewUsersGroupsInstPolicy } from "./policies/view-users-groups-inst.policy";
import { UsersInstCompany } from "../../entities/users-inst-company.entity";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersGroupsInst,
      DclAction,
    ], AMTS_DB_NAME),
    GenericLiquidityModule.generate<DclAction>({
      endpoint: 'liquidity/dcl-actions',
      apiTag: 'Dcl Actions',
      Entity: DclAction,
      policy: new ViewUsersGroupsInstPolicy,
    }),
    GenericLiquidityModule.generate<UsersInstCompany>({
      endpoint: 'liquidity/users-inst-companies',
      apiTag: 'Users Inst Companies',
      Entity: UsersInstCompany,
      policy: new ViewUsersGroupsInstPolicy,
    }),
  ],
  providers: [
    UsersGroupsInstService,
  ],
  exports: [
    UsersGroupsInstService
  ],
  controllers: [UsersGroupsInstController],
})
export class UsersGroupsInstModule {}
