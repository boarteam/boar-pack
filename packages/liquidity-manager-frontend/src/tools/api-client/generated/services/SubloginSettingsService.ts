/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetManySubloginSettingsResponseDto } from '../models/GetManySubloginSettingsResponseDto';
import type { SubloginSettings } from '../models/SubloginSettings';
import type { SubloginSettingsCreateDto } from '../models/SubloginSettingsCreateDto';
import type { SubloginSettingsUpdateDto } from '../models/SubloginSettingsUpdateDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class SubloginSettingsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve a single SubloginSettings
     * @returns SubloginSettings Get one base response
     * @throws ApiError
     */
    public getOneBaseSubloginsSettingsControllerSubloginSettings({
        usersSubAccountInstId,
        instrument,
        worker,
        fields,
        join,
        cache,
    }: {
        usersSubAccountInstId: string,
        instrument: string,
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
    }): CancelablePromise<SubloginSettings> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/sublogins-settings/{usersSubAccountInstId}/{instrument}',
            path: {
                'usersSubAccountInstId': usersSubAccountInstId,
                'instrument': instrument,
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
     * Update a single SubloginSettings
     * @returns SubloginSettings Response
     * @throws ApiError
     */
    public updateOneBaseSubloginsSettingsControllerSubloginSettings({
        usersSubAccountInstId,
        instrument,
        worker,
        requestBody,
    }: {
        usersSubAccountInstId: string,
        instrument: string,
        worker: string,
        requestBody: SubloginSettingsUpdateDto,
    }): CancelablePromise<SubloginSettings> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/{worker}/liquidity/sublogins-settings/{usersSubAccountInstId}/{instrument}',
            path: {
                'usersSubAccountInstId': usersSubAccountInstId,
                'instrument': instrument,
                'worker': worker,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single SubloginSettings
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseSubloginsSettingsControllerSubloginSettings({
        usersSubAccountInstId,
        instrument,
        worker,
    }: {
        usersSubAccountInstId: string,
        instrument: string,
        worker: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/{worker}/liquidity/sublogins-settings/{usersSubAccountInstId}/{instrument}',
            path: {
                'usersSubAccountInstId': usersSubAccountInstId,
                'instrument': instrument,
                'worker': worker,
            },
        });
    }

    /**
     * Retrieve multiple SubloginSettings
     * @returns GetManySubloginSettingsResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseSubloginsSettingsControllerSubloginSettings({
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
    }): CancelablePromise<GetManySubloginSettingsResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/sublogins-settings',
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
     * Create a single SubloginSettings
     * @returns SubloginSettings Get create one base response
     * @throws ApiError
     */
    public createOneBaseSubloginsSettingsControllerSubloginSettings({
        worker,
        requestBody,
    }: {
        worker: string,
        requestBody: SubloginSettingsCreateDto,
    }): CancelablePromise<SubloginSettings> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/{worker}/liquidity/sublogins-settings',
            path: {
                'worker': worker,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
