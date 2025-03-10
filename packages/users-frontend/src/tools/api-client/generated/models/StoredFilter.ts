/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InstrumentsGroup } from './InstrumentsGroup';
import type { User } from './User';
export type StoredFilter = {
    id: string;
    name: string;
    showOffQuotes: boolean;
    onlyProblematic: boolean;
    instruments: Array<string>;
    tradingModes: Array<'Disabled' | 'Long Only' | 'Short Only' | 'Close Only' | 'All Operations'>;
    visibility: StoredFilter.visibility;
    userId: string;
    user: User;
    instrumentsGroups: Array<InstrumentsGroup>;
    createdAt: string;
    updatedAt: string;
};
export namespace StoredFilter {
    export enum visibility {
        PRIVATE = 'PRIVATE',
        PUBLIC = 'PUBLIC',
    }
}

