/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EcnInstrumentsGroupsHistoryService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any
     * @throws ApiError
     */
    public getMany({
        search,
        limit,
        page,
        sortDirection,
        worker,
    }: {
        worker: string,
        search?: string;
        limit?: number;
        page?: number;
        sortDirection?: 'ASC' | 'DESC';
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/ecn-instruments-groups-hst',
            path: {
                'worker': worker,
            },
            query: {
                'search': search,
                'limit': limit,
                'page': page,
                sortDirection,
            },
        });
    }

}
