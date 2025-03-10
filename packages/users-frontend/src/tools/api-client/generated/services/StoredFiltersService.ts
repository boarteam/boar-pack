/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedStoredFiltersResponse } from '../models/PaginatedStoredFiltersResponse';
import type { StoredFilter } from '../models/StoredFilter';
import type { StoredFilterCreateDto } from '../models/StoredFilterCreateDto';
import type { StoredFilterUpdateDto } from '../models/StoredFilterUpdateDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class StoredFiltersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve multiple StoredFilters
     * @returns PaginatedStoredFiltersResponse
     * @throws ApiError
     */
    public getManyBaseStoredFilterControllerStoredFilter({
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
    }): CancelablePromise<PaginatedStoredFiltersResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/filters',
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
     * Create a single StoredFilter
     * @returns StoredFilter Get create one base response
     * @throws ApiError
     */
    public createOneBaseStoredFilterControllerStoredFilter({
        requestBody,
        fields,
        join,
        cache,
    }: {
        requestBody: StoredFilterCreateDto,
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
    }): CancelablePromise<StoredFilter> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/filters',
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a single StoredFilter
     * @returns StoredFilter Response
     * @throws ApiError
     */
    public updateOneBaseStoredFilterControllerStoredFilter({
        id,
        requestBody,
        fields,
        join,
        cache,
    }: {
        id: string,
        requestBody: StoredFilterUpdateDto,
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
    }): CancelablePromise<StoredFilter> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/filters/{id}',
            path: {
                'id': id,
            },
            query: {
                'fields': fields,
                'join': join,
                'cache': cache,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single StoredFilter
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseStoredFilterControllerStoredFilter({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/filters/{id}',
            path: {
                'id': id,
            },
        });
    }
}
