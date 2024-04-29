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
        worker,
        requestBody,
    }: {
        worker: string,
        requestBody: EcnConnectSchemaCreateDto,
    }): CancelablePromise<EcnConnectSchema> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/{worker}/liquidity/ecn-connect-schemas',
            path: {
                'worker': worker,
            },
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
    }): CancelablePromise<GetManyEcnConnectSchemaResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/ecn-connect-schemas',
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

    /**
     * Retrieve a single EcnConnectSchema
     * @returns EcnConnectSchema Get one base response
     * @throws ApiError
     */
    public getOneBaseEcnConnectSchemaControllerEcnConnectSchema({
        id,
        worker,
        fields,
        join,
        cache,
    }: {
        id: number,
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
    }): CancelablePromise<EcnConnectSchema> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/ecn-connect-schemas/{id}',
            path: {
                'id': id,
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
     * Update a single EcnConnectSchema
     * @returns EcnConnectSchema Response
     * @throws ApiError
     */
    public updateOneBaseEcnConnectSchemaControllerEcnConnectSchema({
        id,
        worker,
        requestBody,
    }: {
        id: number,
        worker: string,
        requestBody: EcnConnectSchemaUpdateDto,
    }): CancelablePromise<EcnConnectSchema> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/{worker}/liquidity/ecn-connect-schemas/{id}',
            path: {
                'id': id,
                'worker': worker,
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
        worker,
    }: {
        id: number,
        worker: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/{worker}/liquidity/ecn-connect-schemas/{id}',
            path: {
                'id': id,
                'worker': worker,
            },
        });
    }

}
