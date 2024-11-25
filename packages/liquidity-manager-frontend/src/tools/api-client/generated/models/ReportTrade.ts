/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DclOrderBookType } from './DclOrderBookType';
import type { DclOrderSide } from './DclOrderSide';
import type { DclOrderState } from './DclOrderState';
import type { DclOrderType } from './DclOrderType';

export type ReportTrade = {
    timestamp: number;
    timestampMs: number;
    userId: number;
    subAccount: number;
    clientOrderId: string;
    statusId: number;
    status: DclOrderState;
    bookTypeId: number;
    bookType: DclOrderBookType;
    orderTypeId: number;
    orderType: DclOrderType;
    sideId: number;
    side: DclOrderSide;
    instrument: string;
    amount: number;
    price: number;
    clientPrice: number;
    commissionLiquidity: number;
    commissionTurnover: number;
    profit: number;
    lp: string;
    uniqueOidFileTime: number;
};

