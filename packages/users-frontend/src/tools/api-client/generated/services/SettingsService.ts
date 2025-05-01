/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventSettingsDto } from '../models/EventSettingsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SettingsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns EventSettingsDto
     * @throws ApiError
     */
    public getEventSettings(): CancelablePromise<EventSettingsDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/settings/events',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public setEventSettings({
        requestBody,
    }: {
        requestBody: EventSettingsDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/settings/events',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
