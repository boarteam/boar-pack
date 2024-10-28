/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyViewInstrumentsSpecificationResponseDto } from '../models/GetManyViewInstrumentsSpecificationResponseDto';
import type { ViewInstrumentsSpecification } from '../models/ViewInstrumentsSpecification';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ViewInstrumentsSpecificationsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve a single ViewInstrumentsSpecification
     * @returns ViewInstrumentsSpecification Get one base response
     * @throws ApiError
     */
    public getOneBaseViewInstrumentsSpecificationsControllerViewInstrumentsSpecification({
        instrument,
        worker,
        fields,
        join,
        cache,
    }: {
        instrument: string,
        worker: string,
        /**
         * Selects resource fields. <a href="https://github.com/nestjsx/crud/wiki/Requests#select" target="_blank">Docs</a>
         */
        fields?: Array<string>,
        /**
         * Adds relational resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#join" target="_blank">Docs</a>
         */
        join?: Array<string>,
        /**
         * Reset cache (if was enabled). <a href="https://github.com/nestjsx/crud/wiki/Requests#cache" target="_blank">Docs</a>
         */
        cache?: number,
    }): CancelablePromise<ViewInstrumentsSpecification> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/view-instruments-specifications/{instrument}',
            path: {
                'instrument': instrument,
                'worker': worker,
            },
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
        });
    }

    /**
     * Retrieve multiple ViewInstrumentsSpecifications
     * @returns GetManyViewInstrumentsSpecificationResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseViewInstrumentsSpecificationsControllerViewInstrumentsSpecification({
        worker,
        fields,
        s,
        filter,
        or,
        sort,
        join,
        limit,
        offset,
        page,
        cache,
    }: {
        worker: string,
        /**
         * Selects resource fields. <a href="https://github.com/nestjsx/crud/wiki/Requests#select" target="_blank">Docs</a>
         */
        fields?: Array<string>,
        /**
         * Adds search condition. <a href="https://github.com/nestjsx/crud/wiki/Requests#search" target="_blank">Docs</a>
         */
        s?: string,
        /**
         * Adds filter condition. <a href="https://github.com/nestjsx/crud/wiki/Requests#filter" target="_blank">Docs</a>
         */
        filter?: Array<string>,
        /**
         * Adds OR condition. <a href="https://github.com/nestjsx/crud/wiki/Requests#or" target="_blank">Docs</a>
         */
        or?: Array<string>,
        /**
         * Adds sort by field. <a href="https://github.com/nestjsx/crud/wiki/Requests#sort" target="_blank">Docs</a>
         */
        sort?: Array<string>,
        /**
         * Adds relational resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#join" target="_blank">Docs</a>
         */
        join?: Array<string>,
        /**
         * Limit amount of resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#limit" target="_blank">Docs</a>
         */
        limit?: number,
        /**
         * Offset amount of resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#offset" target="_blank">Docs</a>
         */
        offset?: number,
        /**
         * Page portion of resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#page" target="_blank">Docs</a>
         */
        page?: number,
        /**
         * Reset cache (if was enabled). <a href="https://github.com/nestjsx/crud/wiki/Requests#cache" target="_blank">Docs</a>
         */
        cache?: number,
    }): CancelablePromise<GetManyViewInstrumentsSpecificationResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/view-instruments-specifications',
            path: {
                'worker': worker,
            },
            query: {
                'fields': fields,
                's': s,
                'filter': filter,
                'or': or,
                'sort': sort,
                'join': join,
                'limit': limit,
                'offset': offset,
                'page': page,
                'cache': cache,
            },
        });
    }

}
