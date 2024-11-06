/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportAccountStatement } from '../models/ReportAccountStatement';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ReportAccountStatementsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns ReportAccountStatement
     * @throws ApiError
     */
    public getReport({
        startTime,
        endTime,
        worker,
    }: {
        startTime: string,
        endTime: string,
        worker: string,
    }): CancelablePromise<ReportAccountStatement> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/report-account-statements/report',
            path: {
                'worker': worker,
            },
            query: {
                'startTime': startTime,
                'endTime': endTime,
            },
        });
    }

}
