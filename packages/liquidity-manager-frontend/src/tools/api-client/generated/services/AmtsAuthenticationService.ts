/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AMTSUser } from '../models/AMTSUser';
import type { LocalAuthLoginDto } from '../models/LocalAuthLoginDto';
import type { LocalAuthTokenDto } from '../models/LocalAuthTokenDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AmtsAuthenticationService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns AMTSUser
     * @throws ApiError
     */
    public me(): CancelablePromise<AMTSUser> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/me',
        });
    }

    /**
     * @returns LocalAuthTokenDto
     * @throws ApiError
     */
    public login({
        requestBody,
    }: {
        requestBody: LocalAuthLoginDto,
    }): CancelablePromise<LocalAuthTokenDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public logout(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/logout',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public resetPassword({
        token,
        requestBody,
    }: {
        token: string,
        requestBody: ResetPasswordDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/reset-password/{token}',
            path: {
                'token': token,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
