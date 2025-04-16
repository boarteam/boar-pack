/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TelegramSettingsDto } from '../models/TelegramSettingsDto';
import type { TelegramSettingsUpdateDto } from '../models/TelegramSettingsUpdateDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SettingsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns TelegramSettingsDto
     * @throws ApiError
     */
    public getTelegramSettings(): CancelablePromise<TelegramSettingsDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/settings/telegram',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public setTelegramSettings({
        requestBody,
    }: {
        requestBody: TelegramSettingsUpdateDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/settings/telegram',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
