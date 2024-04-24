/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyUsersGroupsInstResponseDto } from '../models/GetManyUsersGroupsInstResponseDto';
import type { UsersGroupsInst } from '../models/UsersGroupsInst';
import type { UsersGroupsInstCreateDto } from '../models/UsersGroupsInstCreateDto';
import type { UsersGroupsInstUpdateDto } from '../models/UsersGroupsInstUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UsersGroupsInstService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve multiple UsersGroupsInsts
     * @returns GetManyUsersGroupsInstResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseUsersGroupsInstControllerUsersGroupsInst({
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
    }): CancelablePromise<GetManyUsersGroupsInstResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/users-groups-inst',
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
     * Create a single UsersGroupsInst
     * @returns UsersGroupsInst Get create one base response
     * @throws ApiError
     */
    public createOneBaseUsersGroupsInstControllerUsersGroupsInst({
        requestBody,
    }: {
        requestBody: UsersGroupsInstCreateDto,
    }): CancelablePromise<UsersGroupsInst> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/users-groups-inst',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a single UsersGroupsInst
     * @returns UsersGroupsInst Response
     * @throws ApiError
     */
    public updateOneBaseUsersGroupsInstControllerUsersGroupsInst({
        name,
        requestBody,
    }: {
        name: string,
        requestBody: UsersGroupsInstUpdateDto,
    }): CancelablePromise<UsersGroupsInst> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/users-groups-inst/{name}',
            path: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single UsersGroupsInst
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseUsersGroupsInstControllerUsersGroupsInst({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/users-groups-inst/{name}',
            path: {
                'name': name,
            },
        });
    }

}
