// Both module specifiers are mocked to the same fake so cluster.fork() can
// never spawn a real process, no matter which one the code under test uses.
jest.mock('node:cluster', () => {
  const { EventEmitter } = require('node:events');
  const clusterMock = new EventEmitter();
  clusterMock.isWorker = false;
  clusterMock.isPrimary = true;
  clusterMock.fork = jest.fn();
  return { __esModule: true, default: clusterMock };
});
jest.mock('cluster', () => require('node:cluster'));

import cluster from 'node:cluster';
import { EventEmitter } from 'node:events';
import { Logger, NotFoundException } from '@nestjs/common';
import { ClusterService } from './cluster.service';
import { ClusterConfigService } from './cluster.config';
import { WorkerSettings } from './cluster.interface';

const clusterMock = cluster as unknown as EventEmitter & {
  fork: jest.Mock;
  isWorker: boolean;
};

class FakeWorker extends EventEmitter {
  private static nextId = 1;
  public readonly id = FakeWorker.nextId++;
  public kill = jest.fn();
}

const configServiceStub = {
  config: { port: 3000, worker: undefined, disableCluster: false },
} as unknown as ClusterConfigService;

function makeClusterStub({
  workers,
  restartDelay,
  appRole = 'test-role',
}: {
  workers: WorkerSettings[];
  restartDelay?: number;
  appRole?: string;
}) {
  return {
    getSettings: jest.fn().mockResolvedValue({ clusterId: 'c1', appRole, restartDelay }),
    getWorkersSettings: jest.fn().mockResolvedValue(workers),
    onWorkerRun: jest.fn(),
    onWorkerExit: jest.fn(),
    onWorkerListening: jest.fn(),
    onClusterMessage: jest.fn(),
  };
}

const flush = () => new Promise(setImmediate);

function forkedWorker(callIndex: number): FakeWorker {
  return clusterMock.fork.mock.results[callIndex].value as FakeWorker;
}

describe('ClusterService', () => {
  let service: ClusterService;

  beforeAll(() => {
    Logger.overrideLogger([]);
  });

  beforeEach(() => {
    clusterMock.removeAllListeners();
    clusterMock.fork.mockReset();
    clusterMock.fork.mockImplementation(() => new FakeWorker());
    service = new ClusterService(configServiceStub);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('runClusters', () => {
    it('forks one worker per settings entry with computed env vars', async () => {
      const workers: WorkerSettings[] = [
        { workerId: 'w1', portIncrement: 1, extraEnv: { EXTRA: 'x' } },
        // explicit port wins over portIncrement
        { workerId: 'w2', workerName: 'second', portIncrement: 5, port: 4100 },
        { workerId: 'w3', portIncrement: 0 },
        // no port and null increment -> no PORT var at all
        { workerId: 'w4', portIncrement: null },
      ];
      const stub = makeClusterStub({ workers });
      service.addCluster(stub);

      await service.runClusters();

      expect(clusterMock.fork).toHaveBeenCalledTimes(4);
      expect(clusterMock.fork.mock.calls[0][0]).toEqual({
        APP_ROLE: 'test-role',
        WORKER: 'w1',
        WORKER_NAME: 'w1',
        PORT: '3001',
        EXTRA: 'x',
      });
      expect(clusterMock.fork.mock.calls[1][0]).toEqual({
        APP_ROLE: 'test-role',
        WORKER: 'w2',
        WORKER_NAME: 'second',
        PORT: '4100',
      });
      expect(clusterMock.fork.mock.calls[2][0]).toEqual({
        APP_ROLE: 'test-role',
        WORKER: 'w3',
        WORKER_NAME: 'w3',
        PORT: '3000',
      });
      expect(clusterMock.fork.mock.calls[3][0]).toEqual({
        APP_ROLE: 'test-role',
        WORKER: 'w4',
        WORKER_NAME: 'w4',
      });
    });

    it('calls onWorkerRun with settings and vars before forking', async () => {
      const workers: WorkerSettings[] = [{ workerId: 'w1', portIncrement: 1 }];
      const stub = makeClusterStub({ workers });
      service.addCluster(stub);

      await service.runClusters();

      expect(stub.onWorkerRun).toHaveBeenCalledTimes(1);
      expect(stub.onWorkerRun).toHaveBeenCalledWith(workers[0], {
        APP_ROLE: 'test-role',
        WORKER: 'w1',
        WORKER_NAME: 'w1',
        PORT: '3001',
      });
    });

    it('runs all registered clusters', async () => {
      const stubA = makeClusterStub({
        workers: [{ workerId: 'a1', portIncrement: 1 }],
        appRole: 'role-a',
      });
      const stubB = makeClusterStub({
        workers: [{ workerId: 'b1', portIncrement: 2 }],
        appRole: 'role-b',
      });
      service.addCluster(stubA);
      service.addCluster(stubB);

      await service.runClusters();

      expect(clusterMock.fork).toHaveBeenCalledTimes(2);
      const roles = clusterMock.fork.mock.calls.map((call) => call[0].APP_ROLE);
      expect(roles).toEqual(['role-a', 'role-b']);
    });
  });

  describe('worker lifecycle hooks', () => {
    it('calls onWorkerListening when the worker starts listening', async () => {
      const workers: WorkerSettings[] = [{ workerId: 'w1', portIncrement: 1 }];
      const stub = makeClusterStub({ workers });
      service.addCluster(stub);
      await service.runClusters();

      forkedWorker(0).emit('listening');

      expect(stub.onWorkerListening).toHaveBeenCalledTimes(1);
      expect(stub.onWorkerListening).toHaveBeenCalledWith(workers[0]);
    });

    it('forwards cluster messages to onClusterMessage', async () => {
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
      });
      service.addCluster(stub);
      await service.runClusters();

      const worker = forkedWorker(0);
      clusterMock.emit('message', worker, { cmd: 'ping' });

      expect(stub.onClusterMessage).toHaveBeenCalledTimes(1);
      expect(stub.onClusterMessage).toHaveBeenCalledWith(clusterMock, worker, {
        cmd: 'ping',
      });
    });
  });

  describe('auto-restart on exit', () => {
    it('restarts a dead worker immediately when restartDelay is undefined', async () => {
      const workers: WorkerSettings[] = [{ workerId: 'w1', portIncrement: 1 }];
      const stub = makeClusterStub({ workers });
      service.addCluster(stub);
      await service.runClusters();

      forkedWorker(0).emit('exit', 1, null);
      await flush();

      expect(stub.onWorkerExit).toHaveBeenCalledWith(workers[0], 1, null);
      expect(clusterMock.fork).toHaveBeenCalledTimes(2);
      // restarted with the same env vars
      expect(clusterMock.fork.mock.calls[1][0]).toEqual(clusterMock.fork.mock.calls[0][0]);
    });

    it('does not restart a worker stopped with the stop signal', async () => {
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
      });
      service.addCluster(stub);
      await service.runClusters();

      forkedWorker(0).emit('exit', null, 'SIGKILL');
      await flush();

      expect(stub.onWorkerExit).toHaveBeenCalledTimes(1);
      expect(clusterMock.fork).toHaveBeenCalledTimes(1);
    });

    it('waits restartDelay ms before restarting', async () => {
      jest.useFakeTimers({
        doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'],
      });
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
        restartDelay: 500,
      });
      service.addCluster(stub);
      await service.runClusters();

      forkedWorker(0).emit('exit', 1, null);
      await flush();
      expect(clusterMock.fork).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(499);
      await flush();
      expect(clusterMock.fork).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      await flush();
      expect(clusterMock.fork).toHaveBeenCalledTimes(2);
    });
  });

  describe('setWorkerState', () => {
    it('rejects for a cluster that was never added', async () => {
      const stub = makeClusterStub({ workers: [] });
      await expect(service.setWorkerState(stub, 'w1', true)).rejects.toThrow(NotFoundException);
    });

    it('stops a running worker with the stop signal', async () => {
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
      });
      service.addCluster(stub);
      await service.runClusters();
      const worker = forkedWorker(0);

      await service.setWorkerState(stub, 'w1', false);

      expect(worker.kill).toHaveBeenCalledWith('SIGKILL');
      // the exit produced by that signal must not trigger a restart
      worker.emit('exit', null, 'SIGKILL');
      await flush();
      expect(clusterMock.fork).toHaveBeenCalledTimes(1);
    });

    it('restarts a running worker when state is true', async () => {
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
      });
      service.addCluster(stub);
      await service.runClusters();
      const worker = forkedWorker(0);

      await service.setWorkerState(stub, 'w1', true);

      // update = plain kill (no stop signal), so the exit handler reforks
      expect(worker.kill).toHaveBeenCalledWith();
      worker.emit('exit', 0, null);
      await flush();
      expect(clusterMock.fork).toHaveBeenCalledTimes(2);
    });

    it('starts a worker that is not running when state is true', async () => {
      const workers: WorkerSettings[] = [{ workerId: 'w1', portIncrement: 1 }];
      const stub = makeClusterStub({ workers });
      service.addCluster(stub);

      await service.setWorkerState(stub, 'w1', true);

      expect(clusterMock.fork).toHaveBeenCalledTimes(1);
      expect(clusterMock.fork.mock.calls[0][0]).toEqual({
        APP_ROLE: 'test-role',
        WORKER: 'w1',
        WORKER_NAME: 'w1',
        PORT: '3001',
      });
    });

    it('does nothing when stopping a worker that is not running', async () => {
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
      });
      service.addCluster(stub);

      await service.setWorkerState(stub, 'w1', false);

      expect(clusterMock.fork).not.toHaveBeenCalled();
    });

    it('rejects when starting a worker that has no settings', async () => {
      const stub = makeClusterStub({
        workers: [{ workerId: 'w1', portIncrement: 1 }],
      });
      service.addCluster(stub);

      await expect(service.setWorkerState(stub, 'missing', true)).rejects.toThrow(
        NotFoundException,
      );
      expect(clusterMock.fork).not.toHaveBeenCalled();
    });
  });
});
