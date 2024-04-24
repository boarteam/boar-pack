/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcnConnectSchema } from './EcnConnectSchema';
import type { EcnExecutionMode } from './EcnExecutionMode';
import type { EcnInstrument } from './EcnInstrument';

export type EcnSubscrSchema = {
    connectSchemaId: number;
    instrumentHash: string;
    enabled: number;
    markupBid: number;
    defaultMarkupBid: number;
    markupAsk: number;
    defaultMarkupAsk: number;
    minVolume: string;
    maxVolume: string;
    volumeStep: string;
    instrumentWeight: number;
    executionMode: EcnExecutionMode;
    descr?: string;
    reserved: number;
    tradeEnabled: number;
    connectSchema: EcnConnectSchema;
    instrument: EcnInstrument;
};

