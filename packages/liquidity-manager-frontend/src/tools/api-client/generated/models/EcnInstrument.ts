/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcnCommissionLotsMode } from './EcnCommissionLotsMode';
import type { EcnCommissionType } from './EcnCommissionType';
import type { EcnInstrumentsGroup } from './EcnInstrumentsGroup';
import type { EcnMarginCalcMode } from './EcnMarginCalcMode';
import type { EcnProfitCalcMode } from './EcnProfitCalcMode';
import type { EcnSubscrSchema } from './EcnSubscrSchema';
import type { EcnSwapType } from './EcnSwapType';
import type { EcnWeekDay } from './EcnWeekDay';

export type EcnInstrument = {
    instrumentHash: string;
    name: string;
    descr?: string;
    priceDigits: number;
    priceLiquidityLimit: string;
    maxQuoteDeviation: number;
    maxQuoteTimeDeviation: number;
    contractSize: string;
    swapEnable: number;
    swapType: EcnSwapType;
    swapRollover3Days: EcnWeekDay;
    swapLong: string;
    swapShort: string;
    tickPrice: string;
    tickSize: string;
    commission: string;
    commissionType: EcnCommissionType;
    commissionLotsMode: EcnCommissionLotsMode;
    commissionAgent: string;
    commissionAgentType: EcnCommissionType;
    commissionAgentLotsMode: EcnCommissionLotsMode;
    profitMode: EcnProfitCalcMode;
    marginMode: EcnMarginCalcMode;
    marginInitial: string;
    marginMaintenance: string;
    marginHedged: string;
    marginDivider: string;
    marginCurrency: string;
    swapLimit: string;
    tsPriceLiquidityLimit: string;
    currency: string;
    instrumentGroup: EcnInstrumentsGroup;
    startExpirationDatetime: string;
    expirationDatetime: string;
    basis: string;
    delBandOnAbookNos: number;
    delBandOnBbookNos: number;
    subscriptions: Array<EcnSubscrSchema>;
};

