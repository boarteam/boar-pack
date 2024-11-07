import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportBalanceOperationsService } from './report-balance-operations.service';
import { ReportBalanceOperationsController } from './report-balance-operations.controller';
import { ReportBalanceOperation } from './entities/report-balance-operation.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
import { CaslAbilityFactory } from "@jifeon/boar-pack-users-backend/src/casl/casl-ability.factory";
import { ReportBalanceOperationsPermissions } from "./report-balance-operations.permissions";
import { Action } from "@jifeon/boar-pack-users-backend/src/casl/action.enum";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([ReportBalanceOperation], AMTS_DB_NAME),
  ],
  providers: [
    ReportBalanceOperationsService,
  ],
  exports: [
    ReportBalanceOperationsService,
  ],
  controllers: [
    ReportBalanceOperationsController,
  ]
})
export class ReportBalanceOperationsModule {
  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: ReportBalanceOperationsPermissions.VIEW,
      action: Action.Read,
      subject: ReportBalanceOperation,
    });
  }
}
