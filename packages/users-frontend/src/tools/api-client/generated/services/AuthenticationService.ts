/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalAuthLoginDto } from '../models/LocalAuthLoginDto';
import type { LocalAuthTokenDto } from '../models/LocalAuthTokenDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
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
    public loginGoogle(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/google',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public loginGoogleCallback(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/google/callback',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public loginMs(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/ms',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public loginMsCallback(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/ms/callback',
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
