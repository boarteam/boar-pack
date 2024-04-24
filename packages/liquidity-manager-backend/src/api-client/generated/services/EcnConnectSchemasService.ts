/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnConnectSchema } from '../models/EcnConnectSchema';
import type { EcnConnectSchemaCreateDto } from '../models/EcnConnectSchemaCreateDto';
import type { EcnConnectSchemaUpdateDto } from '../models/EcnConnectSchemaUpdateDto';
import type { GetManyEcnConnectSchemaResponseDto } from '../models/GetManyEcnConnectSchemaResponseDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EcnConnectSchemasService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Create a single EcnConnectSchema
     * @returns EcnConnectSchema
     * @throws ApiError
     */
    public createOneBaseEcnConnectSchemaControllerEcnConnectSchema({
        requestBody,
    }: {
        requestBody: EcnConnectSchemaCreateDto,
    }): CancelablePromise<EcnConnectSchema> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/ecn-connect-schemas',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Retrieve multiple EcnConnectSchemas
     * @returns GetManyEcnConnectSchemaResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
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
    }): CancelablePromise<GetManyEcnConnectSchemaResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-connect-schemas',
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
     * Retrieve a single EcnConnectSchema
     * @returns EcnConnectSchema Get one base response
     * @throws ApiError
     */
    public getOneBaseEcnConnectSchemaControllerEcnConnectSchema({
        id,
        fields,
        join,
        cache,
    }: {
        id: number,
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
    }): CancelablePromise<EcnConnectSchema> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-connect-schemas/{id}',
            path: {
                'id': id,
            },
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
        });
    }

    /**
     * Update a single EcnConnectSchema
     * @returns EcnConnectSchema Response
     * @throws ApiError
     */
    public updateOneBaseEcnConnectSchemaControllerEcnConnectSchema({
        id,
        requestBody,
    }: {
        id: number,
        requestBody: EcnConnectSchemaUpdateDto,
    }): CancelablePromise<EcnConnectSchema> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/ecn-connect-schemas/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single EcnConnectSchema
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/ecn-connect-schemas/{id}',
            path: {
                'id': id,
            },
        });
    }

}
