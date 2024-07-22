/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyUserResponseDto } from '../models/GetManyUserResponseDto';
import type { User } from '../models/User';
import type { UserCreateDto } from '../models/UserCreateDto';
import type { UserUpdateDto } from '../models/UserUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UsersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve a single User
     * @returns User Get one base response
     * @throws ApiError
     */
    public getOneBaseUsersControllerUser({
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
    }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/{id}',
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
     * Update a single User
     * @returns User Response
     * @throws ApiError
     */
    public updateOneBaseUsersControllerUser({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UserUpdateDto,
    }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single User
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseUsersControllerUser({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/users/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Retrieve multiple Users
     * @returns GetManyUserResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseUsersControllerUser({
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
    }): CancelablePromise<GetManyUserResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users',
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
     * Create a single User
     * @returns User Get create one base response
     * @throws ApiError
     */
    public createOneBaseUsersControllerUser({
        requestBody,
    }: {
        requestBody: UserCreateDto,
    }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Retrieve a single User
     * @returns any
     * @throws ApiError
     */
    public getOneBaseMeControllerUser({
        fields,
        join,
        cache,
    }: {
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
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/me',
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
        });
    }

}
