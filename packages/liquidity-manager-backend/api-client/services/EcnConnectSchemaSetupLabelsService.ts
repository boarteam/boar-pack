/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EcnConnectSchemaSetupLabel } from '../models/EcnConnectSchemaSetupLabel';
import type { EcnConnectSchemaSetupLabelCreateDto } from '../models/EcnConnectSchemaSetupLabelCreateDto';
import type { EcnConnectSchemaSetupLabelUpdateDto } from '../models/EcnConnectSchemaSetupLabelUpdateDto';
import type { GetManyEcnConnectSchemaSetupLabelResponseDto } from '../models/GetManyEcnConnectSchemaSetupLabelResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EcnConnectSchemaSetupLabelsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve a single EcnConnectSchemaSetupLabel
     * @returns EcnConnectSchemaSetupLabel Get one base response
     * @throws ApiError
     */
    public getOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({
        id,
        fields,
        join,
        cache,
    }: {
        id: number,
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
    }): CancelablePromise<EcnConnectSchemaSetupLabel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-connect-schema-setup-labels/{id}',
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
     * Update a single EcnConnectSchemaSetupLabel
     * @returns EcnConnectSchemaSetupLabel Response
     * @throws ApiError
     */
    public updateOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({
        id,
        requestBody,
    }: {
        id: number,
        requestBody: EcnConnectSchemaSetupLabelUpdateDto,
    }): CancelablePromise<EcnConnectSchemaSetupLabel> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/liquidity/ecn-connect-schema-setup-labels/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a single EcnConnectSchemaSetupLabel
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/liquidity/ecn-connect-schema-setup-labels/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Retrieve multiple EcnConnectSchemaSetupLabels
     * @returns GetManyEcnConnectSchemaSetupLabelResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({
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
    }): CancelablePromise<GetManyEcnConnectSchemaSetupLabelResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liquidity/ecn-connect-schema-setup-labels',
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
     * Create a single EcnConnectSchemaSetupLabel
     * @returns EcnConnectSchemaSetupLabel Get create one base response
     * @throws ApiError
     */
    public createOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel({
        requestBody,
    }: {
        requestBody: EcnConnectSchemaSetupLabelCreateDto,
    }): CancelablePromise<EcnConnectSchemaSetupLabel> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liquidity/ecn-connect-schema-setup-labels',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}