/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Platform } from './Platform';
import type { StoredFilter } from './StoredFilter';
export type InstrumentsGroup = {
    id: string;
    originalPath: string;
    label: string;
    threshold: number;
    color: InstrumentsGroup.color;
    visible: boolean;
    platform: Platform;
    platformId: string;
    filters: Array<StoredFilter>;
    createdAt: string;
    updatedAt: string;
};
export namespace InstrumentsGroup {
    export enum color {
        RED = 'red',
        VOLCANO = 'volcano',
        GOLD = 'gold',
        YELLOW = 'yellow',
        LIME = 'lime',
        GREEN = 'green',
        CYAN = 'cyan',
        BLUE = 'blue',
        GEEKBLUE = 'geekblue',
        PURPLE = 'purple',
        MAGENTA = 'magenta',
    }
}

