import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ClusterInterface, ClusterSettings, WorkerSettings } from "./cluster.interface";
import cluster from "node:cluster";
import { ClusterConfigService, TClusterConfig } from "./cluster.config";
import { Worker } from "cluster";

type TWorkerVars = {
  APP_ROLE: string;
  WORKER: string;
  WORKER_NAME: string;
  PORT?: string;
} & {
  [key: string]: string;
}

@Injectable()
export class ClusterService {
  private readonly logger = new Logger(ClusterService.name);
  private readonly STOP_WORKER = 'SIGKILL';
  private readonly config: TClusterConfig;

  private workersByClusters: Map<ClusterInterface, Map<Worker['id'], {
    worker: Worker,
    workerVars: TWorkerVars,
  }>> = new Map();

  constructor(
    private readonly configService: ClusterConfigService,
  ) {
    this.config = this.configService.config;
  }

  public addCluster(cluster: ClusterInterface) {
    this.workersByClusters.set(cluster, new Map());
  }

  public async runClusters(): Promise<void> {
    const clusters = Array.from(this.workersByClusters.keys());
    await Promise.allSettled(clusters.map(cluster => this.runCluster(cluster)));
  }

  private async runCluster(runningCluster: ClusterInterface) {
    const clusterSettings = await runningCluster.getSettings();
    const workersSettings = await runningCluster.getWorkersSettings();
    workersSettings.forEach(settings => this.runWorker({
      runningCluster,
      clusterSettings,
      workerSettings: settings
    }));
  }

  private runWorker({
    runningCluster,
    clusterSettings,
    workerSettings,
    callback,
  }: {
    runningCluster: ClusterInterface,
    clusterSettings: ClusterSettings,
    workerSettings: WorkerSettings,
    callback?: () => void,
  }) {
    const clusterWorkers = this.workersByClusters.get(runningCluster);

    if (!clusterWorkers) {
      throw new Error(`Cluster ${runningCluster.constructor.name} is not found`);
    }

    const workerName = workerSettings.workerName || workerSettings.workerId;
    this.logger.log(`Starting worker ${workerName}...`);

    const vars: TWorkerVars = {
      APP_ROLE: clusterSettings.appRole,
      WORKER: workerSettings.workerId,
      WORKER_NAME: workerName,
      ...workerSettings.extraEnv,
    }

    if (workerSettings.port) {
      vars.PORT = String(workerSettings.port);
    } else if (workerSettings.portIncrement !== null) {
      vars.PORT = String(this.config.port + workerSettings.portIncrement);
    }

    runningCluster.onWorkerRun?.(workerSettings, vars);

    const workerProcess = cluster.fork(vars);
    clusterWorkers.set(workerProcess.id, {
      worker: workerProcess,
      workerVars: vars,
    });

    cluster.on('message', (worker, message) => {
      runningCluster.onClusterMessage?.(cluster, worker, message);
    })

    workerProcess.on('exit', (code, signal) => {
      clusterWorkers.delete(workerProcess.id);
      runningCluster.onWorkerExit?.(workerSettings, code, signal);

      this.logger.error(`Worker ${workerName} died with code ${code} and signal ${signal}`);

      if (signal === this.STOP_WORKER) {
        this.logger.log(`Worker ${workerName} was stopped and will not be restarted`);
        return;
      }

      if (typeof clusterSettings.restartDelay === 'undefined') {
        this.logger.log(`Restarting worker ${workerName} without delay...`);
        this.startWorker(runningCluster, workerSettings.workerId).catch(err => {
          this.logger.error(`Failed to restart worker ${workerName}: ${err}`);
        });
      } else {
        this.logger.log(`Worker ${workerName} will be restarted in ${clusterSettings.restartDelay}ms...`);
        setTimeout(() => {
          this.logger.log(`Restarting worker ${workerName}...`);
          this.startWorker(runningCluster, workerSettings.workerId).catch(err => {
            this.logger.error(`Failed to restart worker ${workerName}: ${err}`);
          });
        }, clusterSettings.restartDelay);
      }
    });

    workerProcess.once('listening', () => {
      this.logger.log(`Worker ${workerName} started`);
      callback?.();
      runningCluster.onWorkerListening?.(workerSettings);
    });
  }

  public async setWorkerState(cluster: ClusterInterface, workerId: string, state: boolean) {
    const workers = this.workersByClusters.get(cluster);
    if (!workers) {
      throw new NotFoundException(`Cluster ${cluster.constructor.name} is not found`);
    }

    const workerDescriptor = Array.from(workers.values()).find(worker => worker.workerVars.WORKER === workerId);
    if (!workerDescriptor) {
      if (state) {
        await this.startWorker(cluster, workerId);
      } else {
        this.logger.log(`Worker ${workerId} is not found and should be stopped - doing nothing`);
      }
    } else {
      if (state) {
        await this.updateWorker(workerDescriptor.worker, workerId);
      } else {
        await this.stopWorker(workerDescriptor.worker, workerId);
      }
    }
  }

  private async startWorker(runningCluster: ClusterInterface, workerId: string) {
    const clusterSettings = await runningCluster.getSettings();
    const workersSettings = await runningCluster.getWorkersSettings();
    const workerSettings = workersSettings.find(settings => settings.workerId === workerId);

    if (!workerSettings) {
      throw new NotFoundException(`Settings for worker ${workerId} are not found`);
    }

    this.runWorker({
      runningCluster,
      clusterSettings,
      workerSettings,
    });
  }

  private async stopWorker(worker: Worker, workerId: string) {
    this.logger.log(`Stopping worker ${workerId}...`);
    worker.kill(this.STOP_WORKER);
  }

  private async updateWorker(worker: Worker, workerId: string) {
    this.logger.log(`Updating worker ${workerId} by restarting...`);
    worker.kill();
  }
}
