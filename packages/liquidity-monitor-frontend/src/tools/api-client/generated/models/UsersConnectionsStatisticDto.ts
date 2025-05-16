/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UsersConnectionsStatisticDto = {
    time: string;
    records: number;
    userId: string;
    target: UsersConnectionsStatisticDto.target;
    startTime: string;
    endTime: string;
};
export namespace UsersConnectionsStatisticDto {
    export enum target {
        FIX_SERVER = 'fix-server',
        WEBSOCKET_SERVER = 'websocket-server',
    }
}

