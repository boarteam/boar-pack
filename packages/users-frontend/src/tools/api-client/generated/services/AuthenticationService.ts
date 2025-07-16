/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalAuthTokenDto } from '../models/LocalAuthTokenDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns LocalAuthTokenDto
     * @throws ApiError
     */
    public token(): CancelablePromise<LocalAuthTokenDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/token',
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
     * @returns LocalAuthTokenDto
     * @throws ApiError
     */
    public loginAsUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<LocalAuthTokenDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth-manage/login-as-user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
}
