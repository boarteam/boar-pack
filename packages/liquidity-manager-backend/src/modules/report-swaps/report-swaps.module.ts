import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportSwapsService } from './report-swaps.service';
import { ReportSwapsController } from './report-swaps.controller';
import { ReportSwap } from './entities/report-swap.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
import { CaslAbilityFactory } from "@jifeon/boar-pack-users-backend/src/casl/casl-ability.factory";
import { ReportSwapsPermissions } from "./report-swaps.permissions";
import { Action } from "@jifeon/boar-pack-users-backend/src/casl/action.enum";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([ReportSwap], AMTS_DB_NAME),
  ],
  providers: [
    ReportSwapsService,
  ],
  exports: [
    ReportSwapsService,
  ],
  controllers: [
    ReportSwapsController,
  ]
})
export class ReportSwapsModule {
  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: ReportSwapsPermissions.VIEW,
      action: Action.Read,
      subject: ReportSwap,
    });
  }
}
