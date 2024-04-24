/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnInstrumentsGroup } from '../models/EcnInstrumentsGroup';
import type { EcnInstrumentsGroupCreateDto } from '../models/EcnInstrumentsGroupCreateDto';
import type { EcnInstrumentsGroupUpdateDto } from '../models/EcnInstrumentsGroupUpdateDto';
import type { GetManyEcnInstrumentsGroupResponseDto } from '../models/GetManyEcnInstrumentsGroupResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EcnInstrumentsGroupsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve multiple EcnInstrumentsGroups
     * @returns GetManyEcnInstrumentsGroupResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
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
    }): CancelablePromise<GetManyEcnInstrumentsGroupResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-instruments-groups',
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
     * Create a single EcnInstrumentsGroup
     * @returns EcnInstrumentsGroup Get create one base response
     * @throws ApiError
     */
    public createOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
        requestBody,
    }: {
        requestBody: EcnInstrumentsGroupCreateDto,
    }): CancelablePromise<EcnInstrumentsGroup> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/ecn-instruments-groups',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a single EcnInstrumentsGroup
     * @returns EcnInstrumentsGroup Response
     * @throws ApiError
     */
    public updateOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
        id,
        requestBody,
    }: {
        id: number,
        requestBody: EcnInstrumentsGroupUpdateDto,
    }): CancelablePromise<EcnInstrumentsGroup> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/ecn-instruments-groups/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single EcnInstrumentsGroup
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/ecn-instruments-groups/{id}',
            path: {
                'id': id,
            },
        });
    }
}
