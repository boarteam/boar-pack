/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyUsersSubAccountInstResponseDto } from '../models/GetManyUsersSubAccountInstResponseDto';
import type { UsersSubAccountInst } from '../models/UsersSubAccountInst';
import type { UsersSubAccountInstCreateDto } from '../models/UsersSubAccountInstCreateDto';
import type { UsersSubAccountInstUpdateDto } from '../models/UsersSubAccountInstUpdateDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UsersSubAccountsInstService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve a single UsersSubAccountInst
     * @returns UsersSubAccountInst Get one base response
     * @throws ApiError
     */
    public getOneBaseUsersSubAccountsInstControllerUsersSubAccountInst({
        id,
        fields,
        join,
        cache,
    }: {
        id: string,
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
    }): CancelablePromise<UsersSubAccountInst> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/users-sub-accounts-inst/{id}',
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
     * Update a single UsersSubAccountInst
     * @returns UsersSubAccountInst Response
     * @throws ApiError
     */
    public updateOneBaseUsersSubAccountsInstControllerUsersSubAccountInst({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UsersSubAccountInstUpdateDto,
    }): CancelablePromise<UsersSubAccountInst> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/users-sub-accounts-inst/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single UsersSubAccountInst
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseUsersSubAccountsInstControllerUsersSubAccountInst({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/users-sub-accounts-inst/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Retrieve multiple UsersSubAccountInsts
     * @returns GetManyUsersSubAccountInstResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseUsersSubAccountsInstControllerUsersSubAccountInst({
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
    }): CancelablePromise<GetManyUsersSubAccountInstResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/users-sub-accounts-inst',
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
     * Create a single UsersSubAccountInst
     * @returns UsersSubAccountInst Get create one base response
     * @throws ApiError
     */
    public createOneBaseUsersSubAccountsInstControllerUsersSubAccountInst({
        requestBody,
    }: {
        requestBody: UsersSubAccountInstCreateDto,
    }): CancelablePromise<UsersSubAccountInst> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/users-sub-accounts-inst',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
