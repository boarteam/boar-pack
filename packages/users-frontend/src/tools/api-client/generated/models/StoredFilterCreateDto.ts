/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InstrumentsGroup } from './InstrumentsGroup';
export type StoredFilterCreateDto = {
    name: string;
    showOffQuotes: boolean;
    onlyProblematic: boolean;
    instruments: Array<string>;
    instrumentsGroups: Array<InstrumentsGroup>;
    tradingModes: Array<'Disabled' | 'Long Only' | 'Short Only' | 'Close Only' | 'All Operations'>;
    visibility: StoredFilterCreateDto.visibility;
};
export namespace StoredFilterCreateDto {
    export enum visibility {
        PRIVATE = 'PRIVATE',
        PUBLIC = 'PUBLIC',
    }
}

