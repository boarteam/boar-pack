/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EventLogCreateDto = {
    logType: EventLogCreateDto.logType;
    logLevel: EventLogCreateDto.logLevel;
    action: string;
    method?: string;
    userId?: string;
    userRole: string;
    entity: string;
    entityId?: string;
    payload?: Record<string, any>;
    url?: string;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    statusCode?: number;
};
export namespace EventLogCreateDto {
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

