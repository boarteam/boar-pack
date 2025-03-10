/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuotesMonitorCheckDto } from '../models/QuotesMonitorCheckDto';
import type { QuotesMonitorCheckResponseDto } from '../models/QuotesMonitorCheckResponseDto';
import type { QuotesMonitorReloadResponseDto } from '../models/QuotesMonitorReloadResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class QuotesMonitorService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns QuotesMonitorCheckResponseDto
     * @throws ApiError
     */
    public checkConnection({
        requestBody,
    }: {
        requestBody: QuotesMonitorCheckDto,
    }): CancelablePromise<QuotesMonitorCheckResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/quotes-monitor/check',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns QuotesMonitorReloadResponseDto
     * @throws ApiError
     */
    public reloadWorkers(): CancelablePromise<QuotesMonitorReloadResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/quotes-monitor/reload',
        });
    }
}
