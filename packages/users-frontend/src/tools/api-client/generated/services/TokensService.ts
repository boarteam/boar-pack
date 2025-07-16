/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyTokenResponseDto } from '../models/GetManyTokenResponseDto';
import type { Token } from '../models/Token';
import type { TokenCreateDto } from '../models/TokenCreateDto';
import type { TokenUpdateDto } from '../models/TokenUpdateDto';
import type { TokenWithValueDto } from '../models/TokenWithValueDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TokensService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve multiple Tokens
     * @returns GetManyTokenResponseDto
     * @throws ApiError
     */
    public getManyBaseTokensControllerToken({
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
    }): CancelablePromise<GetManyTokenResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tokens',
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
     * Update a single Token
     * @returns Token
     * @throws ApiError
     */
    public updateOneBaseTokensControllerToken({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: TokenUpdateDto,
    }): CancelablePromise<Token> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/tokens/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single Token
     * @returns any
     * @throws ApiError
     */
    public deleteOneBaseTokensControllerToken({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/tokens/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Create a single Token
     * @returns TokenWithValueDto
     * @throws ApiError
     */
    public createOneBaseMyTokensControllerToken({
        requestBody,
    }: {
        requestBody: TokenCreateDto,
    }): CancelablePromise<TokenWithValueDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/my/tokens',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve multiple Tokens
     * @returns GetManyTokenResponseDto
     * @throws ApiError
     */
    public getManyBaseMyTokensControllerToken({
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
    }): CancelablePromise<GetManyTokenResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/my/tokens',
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
     * Update a single Token
     * @returns Token
     * @throws ApiError
     */
    public updateOneBaseMyTokensControllerToken({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: TokenUpdateDto,
    }): CancelablePromise<Token> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/my/tokens/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single Token
     * @returns any
     * @throws ApiError
     */
    public deleteOneBaseMyTokensControllerToken({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/my/tokens/{id}',
            path: {
                'id': id,
            },
        });
    }
}
