/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubscribeToPricesEvent = {
    event: string;
    data: {
        filters?: {
            showOffQuotes?: boolean;
            onlyProblematic?: boolean;
            tradingMode?: Array<'Disabled' | 'Long Only' | 'Short Only' | 'Close Only' | 'All Operations'>;
        };
    };
};

