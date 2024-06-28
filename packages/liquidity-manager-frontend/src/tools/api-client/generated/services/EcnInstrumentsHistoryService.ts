/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EcnInstrumentsHistoryService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any
     * @throws ApiError
     */
    public getMany({
        worker,
        search,
        limit,
        offset,
        sort,
        ids,
        hts,
    }: {
        worker: string,
        search?: string,
        limit?: number,
        offset?: number,
        sort?: any,
        ids?: Array<string>,
        hts?: any,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/ecn-instruments-history',
            path: {
                'worker': worker,
            },
            query: {
                'search': search,
                'limit': limit,
                'offset': offset,
                'sort': sort,
                'ids': ids,
                'hts': hts,
            },
        });
    }

}
