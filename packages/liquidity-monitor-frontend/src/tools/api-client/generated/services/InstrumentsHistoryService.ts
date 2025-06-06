/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InstrumentsHistoryResponseDto } from '../models/InstrumentsHistoryResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class InstrumentsHistoryService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns InstrumentsHistoryResponseDto
     * @throws ApiError
     */
    public getAvailabilityReport({
        sort,
        start,
        end,
        s,
    }: {
        sort?: string,
        start?: string,
        end?: string,
        s?: string,
    }): CancelablePromise<InstrumentsHistoryResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/instruments-history/availability-report',
            query: {
                'sort': sort,
                'start': start,
                'end': end,
                's': s,
            },
        });
    }
}
