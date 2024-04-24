/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnModule } from '../models/EcnModule';
import type { EcnModuleCreateDto } from '../models/EcnModuleCreateDto';
import type { EcnModuleUpdateDto } from '../models/EcnModuleUpdateDto';
import type { GetManyEcnModuleResponseDto } from '../models/GetManyEcnModuleResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EcnModulesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve a single EcnModule
     * @returns EcnModule Get one base response
     * @throws ApiError
     */
    public getOneBaseEcnModulesControllerEcnModule({
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
    }): CancelablePromise<EcnModule> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-modules/{id}',
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
     * Update a single EcnModule
     * @returns EcnModule Response
     * @throws ApiError
     */
    public updateOneBaseEcnModulesControllerEcnModule({
        id,
        requestBody,
    }: {
        id: number,
        requestBody: EcnModuleUpdateDto,
    }): CancelablePromise<EcnModule> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/ecn-modules/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single EcnModule
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnModulesControllerEcnModule({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/ecn-modules/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Retrieve multiple EcnModules
     * @returns GetManyEcnModuleResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnModulesControllerEcnModule({
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
    }): CancelablePromise<GetManyEcnModuleResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-modules',
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
     * Create a single EcnModule
     * @returns EcnModule Get create one base response
     * @throws ApiError
     */
    public createOneBaseEcnModulesControllerEcnModule({
        requestBody,
    }: {
        requestBody: EcnModuleCreateDto,
    }): CancelablePromise<EcnModule> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/ecn-modules',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
