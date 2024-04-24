/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnInstrument } from '../models/EcnInstrument';
import type { EcnInstrumentCreateDto } from '../models/EcnInstrumentCreateDto';
import type { EcnInstrumentUpdateDto } from '../models/EcnInstrumentUpdateDto';
import type { GetEcnInstrumentsInConnectionsResponse } from '../models/GetEcnInstrumentsInConnectionsResponse';
import type { GetManyEcnInstrumentResponseDto } from '../models/GetManyEcnInstrumentResponseDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EcnInstrumentsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns GetEcnInstrumentsInConnectionsResponse
     * @throws ApiError
     */
    public getInConnections({
        compareConnectSchemaId,
        search,
        limit,
        offset,
        showOnlyChanged,
    }: {
        compareConnectSchemaId?: number,
        search?: string,
        limit?: number,
        offset?: number,
        showOnlyChanged?: boolean,
    }): CancelablePromise<GetEcnInstrumentsInConnectionsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-instruments/in-connections',
            query: {
                'compareConnectSchemaId': compareConnectSchemaId,
                'search': search,
                'limit': limit,
                'offset': offset,
                'showOnlyChanged': showOnlyChanged,
            },
        });
    }

    /**
     * Retrieve a single EcnInstrument
     * @returns EcnInstrument Get one base response
     * @throws ApiError
     */
    public getOneBaseEcnInstrumentsControllerEcnInstrument({
        instrumentHash,
        fields,
        join,
        cache,
    }: {
        instrumentHash: string,
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
    }): CancelablePromise<EcnInstrument> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-instruments/{instrumentHash}',
            path: {
                'instrumentHash': instrumentHash,
            },
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
        });
    }

    /**
     * Update a single EcnInstrument
     * @returns EcnInstrument Response
     * @throws ApiError
     */
    public updateOneBaseEcnInstrumentsControllerEcnInstrument({
        instrumentHash,
        requestBody,
    }: {
        instrumentHash: string,
        requestBody: EcnInstrumentUpdateDto,
    }): CancelablePromise<EcnInstrument> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/ecn-instruments/{instrumentHash}',
            path: {
                'instrumentHash': instrumentHash,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single EcnInstrument
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnInstrumentsControllerEcnInstrument({
        instrumentHash,
    }: {
        instrumentHash: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/ecn-instruments/{instrumentHash}',
            path: {
                'instrumentHash': instrumentHash,
            },
        });
    }

    /**
     * Retrieve multiple EcnInstruments
     * @returns GetManyEcnInstrumentResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnInstrumentsControllerEcnInstrument({
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
    }): CancelablePromise<GetManyEcnInstrumentResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-instruments',
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

    /**
     * Create a single EcnInstrument
     * @returns EcnInstrument Get create one base response
     * @throws ApiError
     */
    public createOneBaseEcnInstrumentsControllerEcnInstrument({
        requestBody,
    }: {
        requestBody: EcnInstrumentCreateDto,
    }): CancelablePromise<EcnInstrument> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/ecn-instruments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
