/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type EventLog = {
    id: string;
    logType: EventLog.logType;
    logLevel: EventLog.logLevel;
    action: string;
    method: string | null;
    userId: string | null;
    user: User | null;
    userRole: EventLog.userRole;
    userName: string | null;
    externalUserId: string | null;
    entity: string;
    entityId: string | null;
    payload: Record<string, any> | null;
    url: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    duration: number | null;
    statusCode: number | null;
    service: string;
    serviceId: string | null;
    createdAt: string;
    updatedAt: string;
};
export namespace EventLog {
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
    export enum userRole {
        ADMIN = 'Admin',
        USER = 'User',
        GUEST = 'Guest',
        SYSTEM = 'System',
    }
}

