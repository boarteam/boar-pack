/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type EcnInstrumentCreateDto = {
    name: string;
    descr?: string;
    priceDigits: number;
    priceLiquidityLimit: string;
    maxQuoteDeviation: number;
    maxQuoteTimeDeviation: number;
    contractSize: string;
    swapEnable: number;
    swapType: number;
    swapRollover3Days: number;
    swapLong: string;
    swapShort: string;
    tickPrice: string;
    tickSize: string;
    commission: string;
    commissionType: number;
    commissionLotsMode: number;
    commissionAgent: string;
    commissionAgentType: number;
    commissionAgentLotsMode: number;
    profitMode: number;
    marginMode: number;
    marginInitial: string;
    marginMaintenance: string;
    marginHedged: string;
    marginDivider: string;
    marginCurrency: string;
    swapLimit: string;
    tsPriceLiquidityLimit: string;
    currency: string;
    instrumentGroup: number;
    startExpirationDatetime: string;
    expirationDatetime: string;
    basis: string;
    delBandOnAbookNos: number;
    delBandOnBbookNos: number;
};

