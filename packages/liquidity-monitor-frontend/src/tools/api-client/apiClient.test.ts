import { describe, expect, it } from 'vitest';
import defaultClient, { createApiClient } from './apiClient';
import {
  ApiClient,
  BaseHttpRequest,
  QuotesStatisticsService,
  UsersConnectionsStatisticService,
} from './generated';

describe('createApiClient', () => {
  it('returns an ApiClient instance', () => {
    const client = createApiClient();
    expect(client).toBeInstanceOf(ApiClient);
  });

  it('creates a new instance on every call', () => {
    expect(createApiClient()).not.toBe(createApiClient());
  });

  describe('default configuration', () => {
    it('uses /api as BASE', () => {
      const client = createApiClient();
      expect(client.request.config.BASE).toBe('/api');
    });

    it('uses encodeURIComponent as ENCODE_PATH', () => {
      const client = createApiClient();
      expect(client.request.config.ENCODE_PATH).toBe(encodeURIComponent);
    });

    it('keeps the generated client defaults for the remaining options', () => {
      const { config } = createApiClient().request;
      expect(config.VERSION).toBe('1.0');
      expect(config.WITH_CREDENTIALS).toBe(false);
      expect(config.CREDENTIALS).toBe('include');
      expect(config.TOKEN).toBeUndefined();
      expect(config.USERNAME).toBeUndefined();
      expect(config.PASSWORD).toBeUndefined();
      expect(config.HEADERS).toBeUndefined();
    });
  });

  describe('overrides', () => {
    it('lets the caller override BASE', () => {
      const client = createApiClient({ BASE: 'https://example.com/api/v2' });
      expect(client.request.config.BASE).toBe('https://example.com/api/v2');
      // Other defaults are preserved.
      expect(client.request.config.ENCODE_PATH).toBe(encodeURIComponent);
    });

    it('lets the caller override ENCODE_PATH', () => {
      const encode = (path: string) => `custom:${path}`;
      const client = createApiClient({ ENCODE_PATH: encode });
      expect(client.request.config.ENCODE_PATH).toBe(encode);
      expect(client.request.config.BASE).toBe('/api');
    });

    it('passes through additional OpenAPI options', () => {
      const headers = { 'X-Custom': 'yes' };
      const client = createApiClient({
        TOKEN: 'secret-token',
        WITH_CREDENTIALS: true,
        CREDENTIALS: 'omit',
        HEADERS: headers,
        VERSION: '2.0',
      });
      const { config } = client.request;
      expect(config.TOKEN).toBe('secret-token');
      expect(config.WITH_CREDENTIALS).toBe(true);
      expect(config.CREDENTIALS).toBe('omit');
      expect(config.HEADERS).toBe(headers);
      expect(config.VERSION).toBe('2.0');
    });
  });

  describe('service surface', () => {
    it('exposes the quotesStatistics service', () => {
      const client = createApiClient();
      expect(client.quotesStatistics).toBeInstanceOf(QuotesStatisticsService);
      expect(typeof client.quotesStatistics.getTimeline).toBe('function');
    });

    it('exposes the usersConnectionsStatistic service', () => {
      const client = createApiClient();
      expect(client.usersConnectionsStatistic).toBeInstanceOf(UsersConnectionsStatisticService);
      expect(typeof client.usersConnectionsStatistic.getTimeline).toBe('function');
      expect(typeof client.usersConnectionsStatistic.getTargetsTimeline).toBe('function');
    });

    it('wires both services to the shared http request object', () => {
      const client = createApiClient();
      expect(client.request).toBeInstanceOf(BaseHttpRequest);
      expect(client.quotesStatistics.httpRequest).toBe(client.request);
      expect(client.usersConnectionsStatistic.httpRequest).toBe(client.request);
    });
  });
});

describe('default export', () => {
  it('is a ready-made ApiClient instance with the default configuration', () => {
    expect(defaultClient).toBeInstanceOf(ApiClient);
    expect(defaultClient.request.config.BASE).toBe('/api');
    expect(defaultClient.request.config.ENCODE_PATH).toBe(encodeURIComponent);
  });

  it('is distinct from clients created via createApiClient', () => {
    expect(createApiClient()).not.toBe(defaultClient);
  });
});
