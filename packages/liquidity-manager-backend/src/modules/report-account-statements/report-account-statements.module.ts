import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportAccountStatementsService } from './report-account-statements.service';
import { ReportAccountStatementsController } from './report-account-statements.controller';
import { ReportAccountStatement } from './entities/report-account-statement.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
import { TP_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([ReportAccountStatement], TP_DB_NAME),
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
}
