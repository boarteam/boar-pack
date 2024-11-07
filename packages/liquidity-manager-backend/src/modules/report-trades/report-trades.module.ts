import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTradesService } from './report-trades.service';
import { ReportTradesController } from './report-trades.controller';
import { ReportTrade } from './entities/report-trade.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
import { CaslAbilityFactory } from "@jifeon/boar-pack-users-backend/src/casl/casl-ability.factory";
import { ReportTradesPermissions } from "./report-trades.permissions";
import { Action } from "@jifeon/boar-pack-users-backend/src/casl/action.enum";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([ReportTrade], AMTS_DB_NAME),
  ],
  providers: [
    ReportTradesService,
  ],
  exports: [
    ReportTradesService,
  ],
  controllers: [
    ReportTradesController,
  ]
})
export class ReportTradesModule {
  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: ReportTradesPermissions.VIEW,
      action: Action.Read,
      subject: ReportTrade,
    });
  }
}
