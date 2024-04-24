/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcnCurrency } from './EcnCurrency';
import type { EcnInstrument } from './EcnInstrument';
import type { UsersSubAccountInst } from './UsersSubAccountInst';

export type SubloginSettings = {
    usersSubAccountInstId: string;
    usersSubAccountInst: UsersSubAccountInst;
    instrument: string;
    instrumentRel: EcnInstrument;
    hedgeMultiplier: string;
    spreadLimit: number;
    minVolumeForABook: string;
    spreadLimitOnRollover: number;
    instrumentPriorityFlag: number;
    markupBid: number;
    markupAsk: number;
    alias: string;
    demi: number;
    dema: number;
    hedgeAmount: string;
    hedgeStep: string;
    hedgeCurrency?: EcnCurrency | null;
};

