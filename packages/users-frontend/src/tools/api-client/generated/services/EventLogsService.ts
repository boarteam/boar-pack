/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventLog } from '@@api/generated';
import type { EventLogCreateDto } from '@@api/generated';
import type { EventLogTimelineDto } from '@@api/generated';
import type { EventLogUpdateDto } from '@@api/generated';
import type { GetManyEventLogResponseDto } from '@@api/generated';

import type { CancelablePromise } from '@@api/generated';
import type { BaseHttpRequest } from '@@api/generated';

export class EventLogsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns EventLogTimelineDto
     * @throws ApiError
     */
    public getTimeline({
        startTime,
        endTime,
        timezone,
    }: {
        startTime?: string,
        endTime?: string,
        timezone?: string,
    }): CancelablePromise<Array<EventLogTimelineDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/event-logs/timeline',
            query: {
                'startTime': startTime,
                'endTime': endTime,
                'timezone': timezone,
            },
        });
    }

    /**
     * Retrieve multiple EventLogs
     * @returns GetManyEventLogResponseDto Get paginated response
     * @throws ApiError
     */
    public getManyBaseEventLogsControllerEventLog({
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
    }): CancelablePromise<GetManyEventLogResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/event-logs',
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
     * Create a single EventLog
     * @returns EventLog Get create one base response
     * @throws ApiError
     */
    public createOneBaseEventLogsControllerEventLog({
        requestBody,
    }: {
        requestBody: EventLogCreateDto,
    }): CancelablePromise<EventLog> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/event-logs',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a single EventLog
     * @returns EventLog Response
     * @throws ApiError
     */
    public updateOneBaseEventLogsControllerEventLog({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: EventLogUpdateDto,
    }): CancelablePromise<EventLog> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/event-logs/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a single EventLog
     * @returns any Delete one base response
     * @throws ApiError
     */
    public deleteOneBaseEventLogsControllerEventLog({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/event-logs/{id}',
            path: {
                'id': id,
            },
        });
    }

}
