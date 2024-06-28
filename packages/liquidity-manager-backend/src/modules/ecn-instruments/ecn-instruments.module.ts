import { Module } from '@nestjs/common';
import { EcnInstrumentsService } from './ecn-instruments.service';
import { EcnInstrumentsController } from './ecn-instruments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { EcnSwapType } from "../../entities/ecn-swap-type.entity";
import { GenericLiquidityModule } from "../../tools/generic-liquidity.module";
import { ViewEcnInstrumentsPolicy } from "./policies/view-ecn-instruments.policy";
import { EcnWeekDay } from "../../entities/ecn-week-day.entity";
import { EcnProfitCalcMode } from "../../entities/ecn-profit-calc-mode.entity";
import { EcnMarginCalcMode } from "../../entities/ecn-margin-calc-mode.entity";
import { EcnState } from "../../entities/ecn-state.entity";
import { EcnCurrency } from '../../entities/ecn-currency.entity';
import { EcnWorkingMode } from '../../entities/ecn-working-modes.entity';
import { EcnSubscrSchema } from '../ecn-subscr-schema/entities/ecn-subscr-schema.entity';
import { GenericHistoryModule } from '../../tools/generic-history.module';
import { EcnInstrumentsHistory } from './entities/ecn-instruments-hst.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EcnInstrument,
      EcnSwapType,
      EcnWeekDay,
      EcnProfitCalcMode,
      EcnMarginCalcMode,
      EcnState,
      EcnCurrency,
      EcnWorkingMode,
      EcnSubscrSchema,
    ], AMTS_DB_NAME),
    GenericHistoryModule.generate<EcnInstrumentsHistory>({
      endpoint: 'liquidity/ecn-instruments-history',
      apiTag: 'Ecn Instruments History',
      Entity: EcnInstrumentsHistory,
      policy: new ViewEcnInstrumentsPolicy,
      tableName: 'ecn_instruments_history',
      htsType: 's',
      hactionColumnExists: false,
      idColumnName: 'instrument_hash',
    }),
    GenericLiquidityModule.generate<EcnSwapType>({
      endpoint: 'liquidity/ecn-swap-types',
      apiTag: 'Ecn Swap Types',
      Entity: EcnSwapType,
      policy: new ViewEcnInstrumentsPolicy,
    }),
    GenericLiquidityModule.generate<EcnWeekDay>({
      endpoint: 'liquidity/ecn-week-days',
      apiTag: 'Ecn Week Days',
      Entity: EcnWeekDay,
      policy: new ViewEcnInstrumentsPolicy,
    }),
    GenericLiquidityModule.generate<EcnProfitCalcMode>({
      endpoint: 'liquidity/ecn-profit-calc-modes',
      apiTag: 'Ecn Profit Calc Modes',
      Entity: EcnProfitCalcMode,
      policy: new ViewEcnInstrumentsPolicy,
    }),
    GenericLiquidityModule.generate<EcnMarginCalcMode>({
      endpoint: 'liquidity/ecn-margin-calc-modes',
      apiTag: 'Ecn Margin Calc Modes',
      Entity: EcnMarginCalcMode,
      policy: new ViewEcnInstrumentsPolicy,
    }),
    GenericLiquidityModule.generate<EcnState>({
      endpoint: 'liquidity/ecn-states',
      apiTag: 'Ecn States',
      Entity: EcnState,
      policy: new ViewEcnInstrumentsPolicy,
    }),
    GenericLiquidityModule.generate<EcnCurrency>({
      endpoint: 'liquidity/ecn-currency',
      apiTag: 'Ecn Currencies',
      Entity: EcnCurrency,
      policy: new ViewEcnInstrumentsPolicy,
    }),
    GenericLiquidityModule.generate<EcnWorkingMode>({
      endpoint: 'liquidity/ecn-working-modes',
      apiTag: 'Ecn Working Modes',
      Entity: EcnWorkingMode,
      policy: new ViewEcnInstrumentsPolicy,
    }),
  ],
  providers: [
    EcnInstrumentsService,
  ],
  exports: [
    EcnInstrumentsService
  ],
  controllers: [EcnInstrumentsController],
})
export class EcnInstrumentsModule {}
