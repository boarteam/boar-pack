import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTradesService } from './report-trades.service';
import { ReportTradesController } from './report-trades.controller';
import { ReportTrade } from './entities/report-trade.entity';
import { CaslModule } from "@jifeon/boar-pack-users-backend/src/casl/casl.module";
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { DclOrderType } from "../../entities/dcl-order-type.entity";
import { DclOrderState } from "../../entities/dcl-order-state.entity";
import { DclOrderBookType } from "../../entities/dcl-order-book-type.entity";
import { DclOrderSide } from "../../entities/dcl-order-side.entity";
import { GenericLiquidityModule } from "../../tools/generic-liquidity.module";
import { ViewReportTradesPolicy } from "./policies/view-report-trades.policy";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([
      ReportTrade,
      DclOrderType,
      DclOrderState,
      DclOrderBookType,
      DclOrderSide,
    ], AMTS_DB_NAME),
    GenericLiquidityModule.generate<DclOrderType>({
      endpoint: 'liquidity/dcl-order-types',
      apiTag: 'Order Types',
      Entity: DclOrderType,
      policy: new ViewReportTradesPolicy,
    }),
    GenericLiquidityModule.generate<DclOrderState>({
      endpoint: 'liquidity/dcl-order-states',
      apiTag: 'Order States',
      Entity: DclOrderState,
      policy: new ViewReportTradesPolicy,
    }),
    GenericLiquidityModule.generate<DclOrderBookType>({
      endpoint: 'liquidity/dcl-order-book-types',
      apiTag: 'Order Book Types',
      Entity: DclOrderBookType,
      policy: new ViewReportTradesPolicy,
    }),
    GenericLiquidityModule.generate<DclOrderSide>({
      endpoint: 'liquidity/dcl-order-sides',
      apiTag: 'Order Sides',
      Entity: DclOrderSide,
      policy: new ViewReportTradesPolicy,
    }),
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
}
