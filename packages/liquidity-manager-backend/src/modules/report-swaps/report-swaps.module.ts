import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportSwapsService } from './report-swaps.service';
import { ReportSwapsController } from './report-swaps.controller';
import { ReportSwap } from './entities/report-swap.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
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
}
