import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportAccountStatementsService } from './report-account-statements.service';
import { ReportAccountStatementsController } from './report-account-statements.controller';
import { ReportAccountStatement } from './entities/report-account-statement.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
import { CaslAbilityFactory } from "@jifeon/boar-pack-users-backend/src/casl/casl-ability.factory";
import { ReportAccountStatementsPermissions } from "./report-account-statements.permissions";
import { Action } from "@jifeon/boar-pack-users-backend/src/casl/action.enum";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([ReportAccountStatement], AMTS_DB_NAME),
  ],
  providers: [
    ReportAccountStatementsService,
  ],
  exports: [
    ReportAccountStatementsService,
  ],
  controllers: [
    ReportAccountStatementsController,
  ]
})
export class ReportAccountStatementsModule {
  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: ReportAccountStatementsPermissions.VIEW,
      action: Action.Read,
      subject: ReportAccountStatement,
    });
  }
}
