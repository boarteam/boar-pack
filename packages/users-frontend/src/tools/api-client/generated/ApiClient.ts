/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { NodeHttpRequest } from './core/NodeHttpRequest';
import { AuthenticationService } from './services/AuthenticationService';
import { EventLogsService } from './services/EventLogsService';
import { SettingsService } from './services/SettingsService';
import { TelegrafService } from './services/TelegrafService';
import { TokensService } from './services/TokensService';
import { UsersService } from './services/UsersService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
    public readonly authentication: AuthenticationService;
    public readonly eventLogs: EventLogsService;
    public readonly settings: SettingsService;
    public readonly telegraf: TelegrafService;
    public readonly tokens: TokensService;
    public readonly users: UsersService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = NodeHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.authentication = new AuthenticationService(this.request);
        this.eventLogs = new EventLogsService(this.request);
        this.settings = new SettingsService(this.request);
        this.telegraf = new TelegrafService(this.request);
        this.tokens = new TokensService(this.request);
        this.users = new UsersService(this.request);
    }
}

