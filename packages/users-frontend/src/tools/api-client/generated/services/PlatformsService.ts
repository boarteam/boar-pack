/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManyPlatformResponseDto } from '../models/GetManyPlatformResponseDto';
import type { Platform } from '../models/Platform';
import type { PlatformBasicInfoDto } from '../models/PlatformBasicInfoDto';
import type { PlatformCreateDto } from '../models/PlatformCreateDto';
import type { PlatformUpdateDto } from '../models/PlatformUpdateDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PlatformsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns PlatformBasicInfoDto
     * @throws ApiError
     */
    public getBasicInfo(): CancelablePromise<Array<PlatformBasicInfoDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/platforms/basic-info',
        });
    }
    /**
     * Retrieve multiple Platforms
     * @returns GetManyPlatformResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBasePlatformsControllerPlatform({
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
    }): CancelablePromise<GetManyPlatformResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/platforms',
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
     * Create a single Platform
     * @returns Platform Get create one base response
     * @throws ApiError
     */
    public createOneBasePlatformsControllerPlatform({
        requestBody,
    }: {
        requestBody: PlatformCreateDto,
    }): CancelablePromise<Platform> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/platforms',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a single Platform
     * @returns Platform Response
     * @throws ApiError
     */
    public updateOneBasePlatformsControllerPlatform({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: PlatformUpdateDto,
    }): CancelablePromise<Platform> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/platforms/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single Platform
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBasePlatformsControllerPlatform({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/platforms/{id}',
            path: {
                'id': id,
            },
        });
    }
}
