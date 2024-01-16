import { DynamicModule, Module } from '@nestjs/common';
import { UsersSubAccountsInstService } from './users-sub-accounts-inst.service';
import { UsersSubAccountsInstController } from './users-sub-accounts-inst.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSubAccountInst } from './entities/users-sub-account-inst.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Module({})
export class UsersSubAccountsInstModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: UsersSubAccountsInstModule,
      imports: [
        TypeOrmModule.forFeature([UsersSubAccountInst], AMTS_DB_NAME),
      ],
      providers: [
        UsersSubAccountsInstService,
      ],
      exports: [
        UsersSubAccountsInstService,
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [UsersSubAccountsInstController];
    }

    return dynamicModule;
  }
}
