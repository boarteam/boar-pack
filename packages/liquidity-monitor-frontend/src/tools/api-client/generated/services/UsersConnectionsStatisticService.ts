/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UsersConnectionsStatisticDto } from '../models/UsersConnectionsStatisticDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UsersConnectionsStatisticService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns UsersConnectionsStatisticDto
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
    }): CancelablePromise<Array<UsersConnectionsStatisticDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users-connections-statistic/timeline',
            query: {
                'startTime': startTime,
                'endTime': endTime,
                'timezone': timezone,
            },
        });
    }
}
