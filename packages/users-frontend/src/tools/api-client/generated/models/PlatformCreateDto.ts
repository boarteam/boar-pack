/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PlatformCreateDto = {
    name: string;
    mtVersion: PlatformCreateDto.mtVersion;
    ip: string;
    port: number;
    wsPort: number;
    enabled: boolean;
    login: number;
    pass: string;
    worker: PlatformCreateDto.worker;
};
export namespace PlatformCreateDto {
    export enum mtVersion {
        MT4 = 'mt4',
        MT5 = 'mt5',
    }
    export enum worker {
        WORKER_1 = 'worker_1',
        WORKER_2 = 'worker_2',
        WORKER_3 = 'worker_3',
        WORKER_4 = 'worker_4',
        WORKER_5 = 'worker_5',
        WORKER_6 = 'worker_6',
        WORKER_7 = 'worker_7',
        WORKER_8 = 'worker_8',
        WORKER_9 = 'worker_9',
        WORKER_10 = 'worker_10',
        WORKER_11 = 'worker_11',
        WORKER_12 = 'worker_12',
        WORKER_13 = 'worker_13',
        WORKER_14 = 'worker_14',
        WORKER_15 = 'worker_15',
    }
}

