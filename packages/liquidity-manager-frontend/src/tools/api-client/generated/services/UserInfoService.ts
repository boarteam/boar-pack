/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserInfoDto } from '../models/UserInfoDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UserInfoService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns UserInfoDto
     * @throws ApiError
     */
    public getUserInfo({
        worker,
    }: {
        worker: string,
    }): CancelablePromise<UserInfoDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/{worker}/liquidity/user-info',
            path: {
                'worker': worker,
            },
        });
    }

}
