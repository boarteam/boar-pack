/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PositionDto } from '../models/PositionDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class PositionsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns PositionDto
     * @throws ApiError
     */
    public getPositions({
        userId,
        worker,
    }: {
        userId: number,
        worker: string,
    }): CancelablePromise<Array<PositionDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/positions',
            path: {
                'worker': worker,
            },
            query: {
                'userId': userId,
            },
        });
    }

}
