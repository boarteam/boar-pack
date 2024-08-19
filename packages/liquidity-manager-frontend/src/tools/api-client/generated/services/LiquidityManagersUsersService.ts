/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyLiquidityManagersUserResponseDto } from '../models/GetManyLiquidityManagersUserResponseDto';
import type { LiquidityManagersUser } from '../models/LiquidityManagersUser';
import type { LiquidityManagersUserCreateDto } from '../models/LiquidityManagersUserCreateDto';
import type { LiquidityManagersUserUpdateDto } from '../models/LiquidityManagersUserUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class LiquidityManagersUsersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve multiple LiquidityManagersUsers
     * @returns GetManyLiquidityManagersUserResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseLiquidityManagersUsersControllerLiquidityManagersUser({
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
    }): CancelablePromise<GetManyLiquidityManagersUserResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity-managers-users',
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
     * Create a single LiquidityManagersUser
     * @returns LiquidityManagersUser Get create one base response
     * @throws ApiError
     */
    public createOneBaseLiquidityManagersUsersControllerLiquidityManagersUser({
        requestBody,
    }: {
        requestBody: LiquidityManagersUserCreateDto,
    }): CancelablePromise<LiquidityManagersUser> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity-managers-users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a single LiquidityManagersUser
     * @returns LiquidityManagersUser Response
     * @throws ApiError
     */
    public updateOneBaseLiquidityManagersUsersControllerLiquidityManagersUser({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: LiquidityManagersUserUpdateDto,
    }): CancelablePromise<LiquidityManagersUser> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity-managers-users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single LiquidityManagersUser
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseLiquidityManagersUsersControllerLiquidityManagersUser({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity-managers-users/{id}',
            path: {
                'id': id,
            },
        });
    }

}
