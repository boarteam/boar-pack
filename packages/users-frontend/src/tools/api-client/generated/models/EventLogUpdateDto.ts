/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type EventLogUpdateDto = {
    logType?: EventLogUpdateDto.logType;
    logLevel?: EventLogUpdateDto.logLevel;
    action?: string;
    method?: string;
    userId?: string;
    userRole?: string;
    entity?: string;
    entityId?: string;
    payload?: Record<string, any>;
    url?: string;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    statusCode?: number;
};

export namespace EventLogUpdateDto {

    export enum logType {
        AUDIT = 'Audit',
        OPERATIONAL = 'Operational',
        APPLICATION = 'Application',
    }

    export enum logLevel {
        INFO = 'Info',
        WARNING = 'Warning',
        ERROR = 'Error',
    }


}

