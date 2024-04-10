import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { EcnSwapType } from '../../entities/ecn-swap-type.entity';
import { EcnWeekDay } from '../../entities/ecn-week-day.entity';
import { EcnCommissionType } from '../../entities/ecn-commission-type.entity';
import { EcnCommissionLotsMode } from '../../entities/ecn-commission-lots-mode.entity';
import { EcnProfitCalcMode } from '../../entities/ecn-profit-calc-mode.entity';
import { EcnMarginCalcMode } from '../../entities/ecn-margin-calc-mode.entity';
import { EcnInstrumentsGroup } from '../../ecn-instruments-groups/entities/ecn-instruments-group.entity';

export class EcnInstrumentCreateDto {
  @JoiSchema(Joi.string().max(20).required())
  name: string;

  @JoiSchema(Joi.string().max(512).allow(null))
  descr?: string;

  @JoiSchema(Joi.number().integer().positive().required())
  priceDigits: number;

  @JoiSchema(Joi.string().required())
  priceLiquidityLimit: string;

  @JoiSchema(Joi.number().integer().min(0).required())
  maxQuoteDeviation: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  maxQuoteTimeDeviation: number;

  @JoiSchema(Joi.string().required())
  contractSize: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  swapEnable: number;

  @JoiSchema(Joi.number().integer().required())
  swapType: EcnSwapType['id'];

  @JoiSchema(Joi.number().integer().required())
  swapRollover3Days: EcnWeekDay['id'];

  @JoiSchema(Joi.string().required())
  swapLong: string;

  @JoiSchema(Joi.string().required())
  swapShort: string;

  @JoiSchema(Joi.string().required())
  tickPrice: string;

  @JoiSchema(Joi.string().required())
  tickSize: string;

  @JoiSchema(Joi.string().required())
  commission: string;

  @JoiSchema(Joi.number().integer().required())
  commissionType: EcnCommissionType['id'];

  @JoiSchema(Joi.number().integer().required())
  commissionLotsMode: EcnCommissionLotsMode['id'];

  @JoiSchema(Joi.string().required())
  commissionAgent: string;

  @JoiSchema(Joi.number().integer().required())
  commissionAgentType: EcnCommissionType['id'];

  @JoiSchema(Joi.number().integer().required())
  commissionAgentLotsMode: EcnCommissionLotsMode['id'];

  @JoiSchema(Joi.number().integer().required())
  profitMode: EcnProfitCalcMode['id'];

  @JoiSchema(Joi.number().integer().required())
  marginMode: EcnMarginCalcMode['id'];

  @JoiSchema(Joi.string().required())
  marginInitial: string;

  @JoiSchema(Joi.string().required())
  marginMaintenance: string;

  @JoiSchema(Joi.string().required())
  marginHedged: string;

  @JoiSchema(Joi.string().required())
  marginDivider: string;

  @JoiSchema(Joi.string().max(20).required())
  marginCurrency: string;

  @JoiSchema(Joi.string().required())
  swapLimit: string;

  @JoiSchema(Joi.string().required())
  tsPriceLiquidityLimit: string;

  @JoiSchema(Joi.string().max(20).required())
  currency: string;

  @JoiSchema(Joi.number().integer().required())
  instrumentGroup: EcnInstrumentsGroup['id'];

  @JoiSchema(Joi.date().required())
  startExpirationDatetime: Date;

  @JoiSchema(Joi.date().required())
  expirationDatetime: Date;

  @JoiSchema(Joi.string().max(20).required().allow(''))
  basis: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  delBandOnAbookNos: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  delBandOnBbookNos: number;
}
