/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QuotesMonitorCheckDto = {
    id: string;
    name: string;
    mtVersion: QuotesMonitorCheckDto.mtVersion;
    ip: string;
    port: number;
    wsPort: number;
};
export namespace QuotesMonitorCheckDto {
    export enum mtVersion {
        MT4 = 'mt4',
        MT5 = 'mt5',
    }
}

