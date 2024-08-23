/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GetInstrumentsInConnectionsQueryDto = {
    id?: Array<number>;
    filterInstrument?: Array<string>;
    filterInstrumentsGroup?: Array<number>;
    compareConnectSchemaId?: number;
    search?: string;
    limit?: number;
    offset?: number;
    sortDirection?: GetInstrumentsInConnectionsQueryDto.sortDirection;
    showOnlyChanged?: boolean;
};

export namespace GetInstrumentsInConnectionsQueryDto {

    export enum sortDirection {
        ASC = 'ASC',
        DESC = 'DESC',
    }


}

