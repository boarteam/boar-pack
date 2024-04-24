import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { EcnSwapType } from '../../../entities/ecn-swap-type.entity';
import { EcnWeekDay } from '../../../entities/ecn-week-day.entity';
import { EcnCommissionType } from '../../../entities/ecn-commission-type.entity';
import { EcnCommissionLotsMode } from '../../../entities/ecn-commission-lots-mode.entity';
import { EcnProfitCalcMode } from '../../../entities/ecn-profit-calc-mode.entity';
import { EcnMarginCalcMode } from '../../../entities/ecn-margin-calc-mode.entity';
import { EcnInstrumentsGroup } from '../../ecn-instruments-groups/entities/ecn-instruments-group.entity';

export class EcnInstrumentUpdateDto {
  @JoiSchema(Joi.string().max(20).optional())
  name?: string;

  @JoiSchema(Joi.string().max(512).allow(null).optional())
  descr?: string;

  @JoiSchema(Joi.number().integer().positive().optional())
  priceDigits?: number;

  @JoiSchema(Joi.string().optional())
  priceLiquidityLimit?: string;

  @JoiSchema(Joi.number().integer().min(0).optional())
  maxQuoteDeviation?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  maxQuoteTimeDeviation?: number;

  @JoiSchema(Joi.string().optional())
  contractSize?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  swapEnable?: number;

  @JoiSchema(Joi.number().integer().optional())
  swapType?: EcnSwapType['id'];

  @JoiSchema(Joi.number().integer().optional())
  swapRollover3Days?: EcnWeekDay['id'];

  @JoiSchema(Joi.string().optional())
  swapLong?: string;

  @JoiSchema(Joi.string().optional())
  swapShort?: string;

  @JoiSchema(Joi.string().optional())
  tickPrice?: string;

  @JoiSchema(Joi.string().optional())
  tickSize?: string;

  @JoiSchema(Joi.string().optional())
  commission?: string;

  @JoiSchema(Joi.number().integer().optional())
  commissionType?: EcnCommissionType['id'];

  @JoiSchema(Joi.number().integer().optional())
  commissionLotsMode?: EcnCommissionLotsMode['id'];

  @JoiSchema(Joi.string().optional())
  commissionAgent?: string;

  @JoiSchema(Joi.number().integer().optional())
  commissionAgentType?: EcnCommissionType['id'];

  @JoiSchema(Joi.number().integer().optional())
  commissionAgentLotsMode?: EcnCommissionLotsMode['id'];

  @JoiSchema(Joi.number().integer().optional())
  profitMode?: EcnProfitCalcMode['id'];

  @JoiSchema(Joi.number().integer().optional())
  marginMode?: EcnMarginCalcMode['id'];

  @JoiSchema(Joi.string().optional())
  marginInitial?: string;

  @JoiSchema(Joi.string().optional())
  marginMaintenance?: string;

  @JoiSchema(Joi.string().optional())
  marginHedged?: string;

  @JoiSchema(Joi.string().optional())
  marginDivider?: string;

  @JoiSchema(Joi.string().max(20).optional())
  marginCurrency?: string;

  @JoiSchema(Joi.string().optional())
  swapLimit?: string;

  @JoiSchema(Joi.string().optional())
  tsPriceLiquidityLimit?: string;

  @JoiSchema(Joi.string().max(20).optional())
  currency?: string;

  @JoiSchema(Joi.number().integer().optional())
  instrumentGroup?: EcnInstrumentsGroup['id'];

  @JoiSchema(Joi.date().optional())
  startExpirationDatetime?: Date;

  @JoiSchema(Joi.date().optional())
  expirationDatetime?: Date;

  @JoiSchema(Joi.string().max(20).optional().allow(''))
  basis?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  delBandOnAbookNos?: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  delBandOnBbookNos?: number;
}
