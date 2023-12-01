import { DynamicModule, Module } from '@nestjs/common';
import { EcnInstrumentsService } from './ecn-instruments.service';
import { EcnInstrumentsController } from './ecn-instruments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../app/amts-typeorm.config";
import { EcnSwapType } from "../entities/ecn-swap-type.entity";
import { GenericLiquidityModule } from "../generic-liquidity.module";
import { ViewEcnInstrumentsPolicy } from "./policies/view-ecn-instruments.policy";
import { EcnWeekDay } from "../entities/ecn-week-day.entity";
import { EcnProfitCalcMode } from "../entities/ecn-profit-calc-mode.entity";
import { EcnMarginCalcMode } from "../entities/ecn-margin-calc-mode.entity";

@Module({})
export class EcnInstrumentsModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnInstrumentsModule,
      imports: [
        TypeOrmModule.forFeature([
          EcnInstrument,
          EcnSwapType,
          EcnWeekDay,
          EcnProfitCalcMode,
          EcnMarginCalcMode,
        ], AMTS_DB_NAME),
        GenericLiquidityModule.generate<EcnSwapType>({
          endpoint: 'ecn-swap-types',
          apiTag: 'Ecn Swap Types',
          Entity: EcnSwapType,
          policy: new ViewEcnInstrumentsPolicy,
        }),
        GenericLiquidityModule.generate<EcnWeekDay>({
          endpoint: 'ecn-week-days',
          apiTag: 'Ecn Week Days',
          Entity: EcnWeekDay,
          policy: new ViewEcnInstrumentsPolicy,
        }),
        GenericLiquidityModule.generate<EcnProfitCalcMode>({
          endpoint: 'ecn-profit-calc-modes',
          apiTag: 'Ecn Profit Calc Modes',
          Entity: EcnProfitCalcMode,
          policy: new ViewEcnInstrumentsPolicy,
        }),
        GenericLiquidityModule.generate<EcnMarginCalcMode>({
          endpoint: 'ecn-margin-calc-modes',
          apiTag: 'Ecn Margin Calc Modes',
          Entity: EcnMarginCalcMode,
          policy: new ViewEcnInstrumentsPolicy,
        }),
      ],
      providers: [
        EcnInstrumentsService,
      ],
      exports: [
        EcnInstrumentsService
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnInstrumentsController];
    }

    return dynamicModule;
  }
}
