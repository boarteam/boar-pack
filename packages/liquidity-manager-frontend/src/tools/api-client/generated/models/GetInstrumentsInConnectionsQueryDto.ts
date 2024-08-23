/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GetInstrumentsInConnectionsQueryDto = {
    id?: Record<string, any>;
    filterInstrument?: Record<string, any>;
    filterInstrumentsGroup?: Record<string, any>;
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

