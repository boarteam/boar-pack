/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuotesStatisticDto } from '../models/QuotesStatisticDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class QuotesStatisticsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns QuotesStatisticDto
     * @throws ApiError
     */
    public getTimeline({
        startTime,
        endTime,
        timezone,
        upcoming,
    }: {
        startTime?: string,
        endTime?: string,
        timezone?: string,
        upcoming?: boolean,
    }): CancelablePromise<Array<QuotesStatisticDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/quotes-statistic/timeline',
            query: {
                'startTime': startTime,
                'endTime': endTime,
                'timezone': timezone,
                'upcoming': upcoming,
            },
        });
    }
}
