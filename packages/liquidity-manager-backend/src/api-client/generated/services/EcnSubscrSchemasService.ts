/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnSubscrSchema } from '../models/EcnSubscrSchema';
import type { EcnSubscrSchemaCreateDto } from '../models/EcnSubscrSchemaCreateDto';
import type { EcnSubscrSchemaUpdateDto } from '../models/EcnSubscrSchemaUpdateDto';
import type { GetManyEcnSubscrSchemaResponseDto } from '../models/GetManyEcnSubscrSchemaResponseDto';
import type { SubscSchemasCountResponse } from '../models/SubscSchemasCountResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EcnSubscrSchemasService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns SubscSchemasCountResponse
     * @throws ApiError
     */
    public getCount({
        connectSchemaId,
    }: {
        connectSchemaId: number,
    }): CancelablePromise<SubscSchemasCountResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-subscr-schemas/count/{connectSchemaId}',
            path: {
                'connectSchemaId': connectSchemaId,
            },
        });
    }

    /**
     * Retrieve a single EcnSubscrSchema
     * @returns EcnSubscrSchema Get one base response
     * @throws ApiError
     */
    public getOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
        instrumentHash,
        connectSchemaId,
        fields,
        join,
        cache,
    }: {
        instrumentHash: string,
        connectSchemaId: number,
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
    }): CancelablePromise<EcnSubscrSchema> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-subscr-schemas/{instrumentHash}/{connectSchemaId}',
            path: {
                'instrumentHash': instrumentHash,
                'connectSchemaId': connectSchemaId,
            },
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
        });
    }

    /**
     * Update a single EcnSubscrSchema
     * @returns EcnSubscrSchema Response
     * @throws ApiError
     */
    public updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
        instrumentHash,
        connectSchemaId,
        requestBody,
    }: {
        instrumentHash: string,
        connectSchemaId: number,
        requestBody: EcnSubscrSchemaUpdateDto,
    }): CancelablePromise<EcnSubscrSchema> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/ecn-subscr-schemas/{instrumentHash}/{connectSchemaId}',
            path: {
                'instrumentHash': instrumentHash,
                'connectSchemaId': connectSchemaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single EcnSubscrSchema
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
        instrumentHash,
        connectSchemaId,
    }: {
        instrumentHash: string,
        connectSchemaId: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/ecn-subscr-schemas/{instrumentHash}/{connectSchemaId}',
            path: {
                'instrumentHash': instrumentHash,
                'connectSchemaId': connectSchemaId,
            },
        });
    }

    /**
     * Retrieve multiple EcnSubscrSchemas
     * @returns GetManyEcnSubscrSchemaResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema({
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
    }): CancelablePromise<GetManyEcnSubscrSchemaResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-subscr-schemas',
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
     * Create a single EcnSubscrSchema
     * @returns EcnSubscrSchema Get create one base response
     * @throws ApiError
     */
    public createOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
        requestBody,
    }: {
        requestBody: EcnSubscrSchemaCreateDto,
    }): CancelablePromise<EcnSubscrSchema> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/ecn-subscr-schemas',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
