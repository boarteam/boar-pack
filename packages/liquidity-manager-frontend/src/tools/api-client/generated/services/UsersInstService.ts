/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyUsersInstResponseDto } from '../models/GetManyUsersInstResponseDto';
import type { UsersInst } from '../models/UsersInst';
import type { UsersInstCreateDto } from '../models/UsersInstCreateDto';
import type { UsersInstUpdateDto } from '../models/UsersInstUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UsersInstService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve a single UsersInst
     * @returns UsersInst Get one base response
     * @throws ApiError
     */
    public getOneBaseUsersInstControllerUsersInst({
        id,
        worker,
        fields,
        join,
        cache,
    }: {
        id: string,
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
    }): CancelablePromise<UsersInst> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/users-inst/{id}',
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
     * Update a single UsersInst
     * @returns UsersInst Response
     * @throws ApiError
     */
    public updateOneBaseUsersInstControllerUsersInst({
        id,
        worker,
        requestBody,
    }: {
        id: string,
        worker: string,
        requestBody: UsersInstUpdateDto,
    }): CancelablePromise<UsersInst> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/{worker}/liquidity/users-inst/{id}',
            path: {
                'id': id,
                'worker': worker,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single UsersInst
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseUsersInstControllerUsersInst({
        id,
        worker,
    }: {
        id: string,
        worker: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/{worker}/liquidity/users-inst/{id}',
            path: {
                'id': id,
                'worker': worker,
            },
        });
    }

    /**
     * Retrieve multiple UsersInsts
     * @returns GetManyUsersInstResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseUsersInstControllerUsersInst({
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
    }): CancelablePromise<GetManyUsersInstResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/users-inst',
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
     * Create a single UsersInst
     * @returns UsersInst Get create one base response
     * @throws ApiError
     */
    public createOneBaseUsersInstControllerUsersInst({
        worker,
        requestBody,
    }: {
        worker: string,
        requestBody: UsersInstCreateDto,
    }): CancelablePromise<UsersInst> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/{worker}/liquidity/users-inst',
            path: {
                'worker': worker,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
