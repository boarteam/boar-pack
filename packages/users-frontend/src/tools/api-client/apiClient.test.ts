import { describe, expect, it } from 'vitest';
import { createApiClient } from './apiClient';
import defaultClient from './apiClient';
import { ApiClient } from './generated';
import { AuthenticationService } from './generated/services/AuthenticationService';
import { EventLogsService } from './generated/services/EventLogsService';
import { SettingsService } from './generated/services/SettingsService';
import { TelegrafService } from './generated/services/TelegrafService';
import { TokensService } from './generated/services/TokensService';
import { UsersService } from './generated/services/UsersService';

describe('createApiClient', () => {
  it('returns an ApiClient instance', () => {
    expect(createApiClient()).toBeInstanceOf(ApiClient);
  });

  it('defaults BASE to /api', () => {
    const client = createApiClient();
    expect(client.request.config.BASE).toBe('/api');
  });

  it('defaults ENCODE_PATH to encodeURIComponent', () => {
    const client = createApiClient();
    expect(client.request.config.ENCODE_PATH).toBe(encodeURIComponent);
  });

  it('applies the generated defaults for the remaining config options', () => {
    const client = createApiClient();
    expect(client.request.config.VERSION).toBe('1.0');
    expect(client.request.config.WITH_CREDENTIALS).toBe(false);
    expect(client.request.config.CREDENTIALS).toBe('include');
    expect(client.request.config.TOKEN).toBeUndefined();
  });

  it('lets overrides win over the defaults', () => {
    const encode = (v: string) => v;
    const client = createApiClient({
      BASE: 'https://example.com/v2',
      ENCODE_PATH: encode,
      WITH_CREDENTIALS: true,
      TOKEN: 'secret',
    });
    expect(client.request.config.BASE).toBe('https://example.com/v2');
    expect(client.request.config.ENCODE_PATH).toBe(encode);
    expect(client.request.config.WITH_CREDENTIALS).toBe(true);
    expect(client.request.config.TOKEN).toBe('secret');
  });

  it('exposes all generated services', () => {
    const client = createApiClient();
    expect(client.authentication).toBeInstanceOf(AuthenticationService);
    expect(client.eventLogs).toBeInstanceOf(EventLogsService);
    expect(client.settings).toBeInstanceOf(SettingsService);
    expect(client.telegraf).toBeInstanceOf(TelegrafService);
    expect(client.tokens).toBeInstanceOf(TokensService);
    expect(client.users).toBeInstanceOf(UsersService);
  });

  it('wires every service to the same request instance', () => {
    const client = createApiClient();
    expect(client.users.httpRequest).toBe(client.request);
    expect(client.tokens.httpRequest).toBe(client.request);
    expect(client.eventLogs.httpRequest).toBe(client.request);
    expect(client.authentication.httpRequest).toBe(client.request);
  });

  it('exports a ready default instance configured with /api', () => {
    expect(defaultClient).toBeInstanceOf(ApiClient);
    expect(defaultClient.request.config.BASE).toBe('/api');
    expect(defaultClient.request.config.ENCODE_PATH).toBe(encodeURIComponent);
  });
});
