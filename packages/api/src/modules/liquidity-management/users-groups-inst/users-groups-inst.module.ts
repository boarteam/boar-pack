import { DynamicModule, Module } from '@nestjs/common';
import { UsersGroupsInstService } from './users-groups-inst.service';
import { UsersGroupsInstController } from './users-groups-inst.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersGroupsInst } from './entities/users-groups-inst.entity';
import { TModuleConfig } from "../../app/app.types";
import { DclAction } from "../entities/dcl-action.entity";
import { GenericLiquidityModule } from "../generic-liquidity.module";
import { ViewUsersGroupsInstPolicy } from "./policies/view-users-groups-inst.policy";
import { UsersInstCompany } from "../entities/users-inst-company.entity";
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Module({})
export class UsersGroupsInstModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: UsersGroupsInstModule,
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
    };

    if (config.withControllers) {
      dynamicModule.controllers = [UsersGroupsInstController];
    }

    return dynamicModule;
  }
}
