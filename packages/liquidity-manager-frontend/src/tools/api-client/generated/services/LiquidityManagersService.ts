/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyLiquidityManagerResponseDto } from '../models/GetManyLiquidityManagerResponseDto';
import type { LiquidityManager } from '../models/LiquidityManager';
import type { LiquidityManagerCheckDto } from '../models/LiquidityManagerCheckDto';
import type { LiquidityManagerCheckResponseDto } from '../models/LiquidityManagerCheckResponseDto';
import type { LiquidityManagerCreateDto } from '../models/LiquidityManagerCreateDto';
import type { LiquidityManagerUpdateDto } from '../models/LiquidityManagerUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class LiquidityManagersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns LiquidityManagerCheckResponseDto
     * @throws ApiError
     */
    public checkConnection({
        requestBody,
    }: {
        requestBody: LiquidityManagerCheckDto,
    }): CancelablePromise<LiquidityManagerCheckResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidityManagers/check',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Retrieve multiple LiquidityManagers
     * @returns GetManyLiquidityManagerResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseLiquidityManagersControllerLiquidityManager({
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
    }): CancelablePromise<GetManyLiquidityManagerResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidityManagers',
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
     * Create a single LiquidityManager
     * @returns LiquidityManager Get create one base response
     * @throws ApiError
     */
    public createOneBaseLiquidityManagersControllerLiquidityManager({
        requestBody,
    }: {
        requestBody: LiquidityManagerCreateDto,
    }): CancelablePromise<LiquidityManager> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidityManagers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a single LiquidityManager
     * @returns LiquidityManager Response
     * @throws ApiError
     */
    public updateOneBaseLiquidityManagersControllerLiquidityManager({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: LiquidityManagerUpdateDto,
    }): CancelablePromise<LiquidityManager> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidityManagers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single LiquidityManager
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseLiquidityManagersControllerLiquidityManager({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidityManagers/{id}',
            path: {
                'id': id,
            },
        });
    }

}
