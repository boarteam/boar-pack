// Mocked so tests can flip isWorker without actually running inside a forked
// cluster worker.
jest.mock('node:cluster', () => ({
  __esModule: true,
  default: { isWorker: false, isPrimary: true },
}));

import cluster from 'node:cluster';
import { ConfigService } from '@nestjs/config';
import { ClusterConfigService } from './cluster.config';

const clusterMock = cluster as unknown as { isWorker: boolean };

const ENV_KEYS = ['PORT', 'WORKER', 'DISABLE_CLUSTER'] as const;

describe('ClusterConfigService', () => {
  const originalEnv: Partial<Record<string, string>> = {};

  beforeAll(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
    }
  });

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
    clusterMock.isWorker = false;
  });

  afterAll(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  function getConfig() {
    return new ClusterConfigService(new ConfigService()).config;
  }

  describe('PORT', () => {
    it('throws when PORT is not set and cluster is enabled', () => {
      expect(() => getConfig()).toThrow('PORT env variable is not set');
    });

    it('throws when PORT is set to an empty string', () => {
      process.env.PORT = '';
      expect(() => getConfig()).toThrow('PORT env variable is not set');
    });

    it('throws a distinct error when PORT is not numeric', () => {
      process.env.PORT = 'not-a-number';
      expect(() => getConfig()).toThrow(
        'PORT env variable is not a valid port number: "not-a-number" ' +
          '(expected an integer between 1 and 65535)',
      );
      // the misleading "not set" wording must not be reused for a value that is set
      expect(() => getConfig()).not.toThrow('PORT env variable is not set');
    });

    it('throws a distinct error when PORT is 0', () => {
      // 0 means "OS picks a free port", which cannot be used as the base for
      // the per-worker `port + portIncrement` arithmetic
      process.env.PORT = '0';
      expect(() => getConfig()).toThrow('PORT env variable is not a valid port number: "0"');
      expect(() => getConfig()).not.toThrow('PORT env variable is not set');
    });

    it('throws a distinct error when PORT is out of range', () => {
      process.env.PORT = '65536';
      expect(() => getConfig()).toThrow('PORT env variable is not a valid port number: "65536"');
    });

    it('throws a distinct error when PORT has trailing garbage', () => {
      process.env.PORT = '3000abc';
      expect(() => getConfig()).toThrow('PORT env variable is not a valid port number: "3000abc"');
    });

    it('accepts the boundary ports', () => {
      process.env.PORT = '1';
      expect(getConfig().port).toBe(1);

      process.env.PORT = '65535';
      expect(getConfig().port).toBe(65535);
    });

    it('parses a numeric PORT', () => {
      process.env.PORT = '3000';
      expect(getConfig()).toEqual({
        port: 3000,
        worker: undefined,
        disableCluster: false,
      });
    });
  });

  describe('WORKER', () => {
    it('is not required on the primary process', () => {
      process.env.PORT = '3000';
      expect(getConfig().worker).toBeUndefined();
    });

    it('throws in a worker process when WORKER is not set', () => {
      process.env.PORT = '3000';
      clusterMock.isWorker = true;
      expect(() => getConfig()).toThrow('WORKER env variable is not set');
    });

    it('returns the worker id in a worker process', () => {
      process.env.PORT = '3000';
      process.env.WORKER = 'worker-1';
      clusterMock.isWorker = true;
      expect(getConfig()).toEqual({
        port: 3000,
        worker: 'worker-1',
        disableCluster: false,
      });
    });
  });

  describe('DISABLE_CLUSTER', () => {
    it('skips PORT and WORKER validation when "true"', () => {
      process.env.DISABLE_CLUSTER = 'true';
      clusterMock.isWorker = true;

      const config = getConfig();
      expect(config.disableCluster).toBe(true);
      expect(config.worker).toBeUndefined();
      // PORT is still parsed, it just is not validated
      expect(Number.isNaN(config.port)).toBe(true);
    });

    it('is false for any value other than "true"', () => {
      process.env.PORT = '3000';
      process.env.DISABLE_CLUSTER = '1';
      expect(getConfig().disableCluster).toBe(false);

      process.env.DISABLE_CLUSTER = 'TRUE';
      expect(getConfig().disableCluster).toBe(false);
    });

    it('still validates PORT when "false"', () => {
      process.env.DISABLE_CLUSTER = 'false';
      expect(() => getConfig()).toThrow('PORT env variable is not set');
    });
  });
});
