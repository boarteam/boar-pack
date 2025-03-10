/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FormattedGroup } from './FormattedGroup';
import type { ShortFormattedInstrument } from './ShortFormattedInstrument';
export type PlatformStatsEvent = {
    event: string;
    data: {
        state?: PlatformStatsEvent.state;
        error?: string;
        instruments?: Array<ShortFormattedInstrument>;
        groups?: Array<FormattedGroup>;
    };
};
export namespace PlatformStatsEvent {
    export enum state {
        CONNECTING = 'Connecting',
        CONNECTED = 'Connected',
        DISCONNECTED = 'Disconnected',
    }
}

