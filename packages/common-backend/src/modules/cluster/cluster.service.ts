import { Injectable, Logger } from "@nestjs/common";
import { ClusterInterface, ClusterSettings, WorkerSettings } from "./cluster.interface";
import cluster from "node:cluster";
import { ClusterConfigService, TClusterConfig } from "./cluster.config";

@Injectable()
export class ClusterService {
  private readonly logger = new Logger(ClusterService.name);
  private readonly STOP_WORKER = 'SIGKILL';
  private readonly config: TClusterConfig;

  private clusters: ClusterInterface[] = [];

  constructor(
    private readonly configService: ClusterConfigService,
  ) {
    this.config = this.configService.config;
  }

  public addCluster(cluster: ClusterInterface) {
    this.clusters.push(cluster);
  }

  public async runClusters(): Promise<void> {
    await Promise.allSettled(this.clusters.map(cluster => this.runCluster(cluster)));
  }

  private async runCluster(cluster: ClusterInterface) {
    const clusterSettings = await cluster.getSettings();
    const workersSettings = await cluster.getWorkersSettings();
    workersSettings.forEach(settings => this.runWorker({
      clusterSettings,
      settings
    }));
  }

  private runWorker({
    clusterSettings,
    settings,
    callback,
  }: {
    clusterSettings: ClusterSettings,
    settings: WorkerSettings,
    callback?: () => void,
  }) {
    const workerName = settings.workerName || settings.workerId;
    this.logger.log(`Starting worker ${workerName}...`);

    const vars: Record<string, string> = {
      APP_ROLE: clusterSettings.appRole,
      WORKER: settings.workerId,
      WORKER_NAME: workerName,
      ...settings.extraEnv,
    }

    if (settings.portIncrement !== null) {
      vars.PORT = String(this.config.port + settings.portIncrement);
    }

    const workerProcess = cluster.fork(vars);

    workerProcess.on('exit', (code, signal) => {
      this.logger.error(`Worker ${workerName} died with code ${code} and signal ${signal}`);

      if (signal === this.STOP_WORKER) {
        return;
      }

      if (typeof clusterSettings.restartDelay === 'undefined') {
        this.runWorker({ clusterSettings, settings });
      } else {
        setTimeout(() => {
          this.logger.log(`Restarting worker ${workerName}...`);
          this.runWorker({ clusterSettings, settings });
        }, clusterSettings.restartDelay);
      }
    });

    workerProcess.once('listening', () => {
      this.logger.log(`Worker ${workerName} started`);
      callback?.();
    });
  }
}
