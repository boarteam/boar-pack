/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EventLogTimelineDto = {
    time: string;
    records: number;
    logLevel: EventLogTimelineDto.logLevel;
    startTime: string;
    endTime: string;
};
export namespace EventLogTimelineDto {
    export enum logLevel {
        INFO = 'Info',
        WARNING = 'Warning',
        ERROR = 'Error',
    }
}

