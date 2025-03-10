/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ApplicationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns string
     * @throws ApiError
     */
    public health(): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/health',
        });
    }
}
