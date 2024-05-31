/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnModuleType } from '../models/EcnModuleType';
import type { EcnModuleTypeCreateDto } from '../models/EcnModuleTypeCreateDto';
import type { EcnModuleTypeUpdateDto } from '../models/EcnModuleTypeUpdateDto';
import type { GetManyEcnModuleTypeResponseDto } from '../models/GetManyEcnModuleTypeResponseDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EcnModuleTypesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve multiple EcnModuleTypes
     * @returns GetManyEcnModuleTypeResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnModuleTypesControllerEcnModuleType({
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
    }): CancelablePromise<GetManyEcnModuleTypeResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/ecn-module-types',
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
     * Create a single EcnModuleType
     * @returns EcnModuleType Get create one base response
     * @throws ApiError
     */
    public createOneBaseEcnModuleTypesControllerEcnModuleType({
        worker,
        requestBody,
    }: {
        worker: string,
        requestBody: EcnModuleTypeCreateDto,
    }): CancelablePromise<EcnModuleType> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/{worker}/liquidity/ecn-module-types',
            path: {
                'worker': worker,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a single EcnModuleType
     * @returns EcnModuleType Response
     * @throws ApiError
     */
    public updateOneBaseEcnModuleTypesControllerEcnModuleType({
        id,
        worker,
        requestBody,
    }: {
        id: number,
        worker: string,
        requestBody: EcnModuleTypeUpdateDto,
    }): CancelablePromise<EcnModuleType> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/{worker}/liquidity/ecn-module-types/{id}',
            path: {
                'id': id,
                'worker': worker,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single EcnModuleType
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnModuleTypesControllerEcnModuleType({
        id,
        worker,
    }: {
        id: number,
        worker: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/{worker}/liquidity/ecn-module-types/{id}',
            path: {
                'id': id,
                'worker': worker,
            },
        });
    }

}
