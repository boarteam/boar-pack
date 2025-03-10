/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ShortFormattedInstrument = {
    symbol: string;
    tradingMode: ShortFormattedInstrument.tradingMode;
    groupId: string;
    problematic: boolean;
    offQuotes: boolean;
};
export namespace ShortFormattedInstrument {
    export enum tradingMode {
        DISABLED = 'Disabled',
        LONG_ONLY = 'Long Only',
        SHORT_ONLY = 'Short Only',
        CLOSE_ONLY = 'Close Only',
        ALL_OPERATIONS = 'All Operations',
    }
}

