import { Injectable, Logger } from "@nestjs/common";
import { LiquidityManagersService } from "./liquidity-managers.service";
import { LiquidityManagerWorkers } from "./entities/liquidity-manager.entity";
import { ClusterInterface, ClusterSettings, WorkerSettings } from "@jifeon/boar-pack-common-backend";
import { EventLogsService, LogLevel } from "@jifeon/boar-pack-users-backend";

@Injectable()
export class LiquidityManagersCluster implements ClusterInterface {
  private readonly logger = new Logger(LiquidityManagersCluster.name);

  constructor(
    private readonly liquidityManagersService: LiquidityManagersService,
    private readonly eventLogsService: EventLogsService,
  ) {
  }

  private readonly portIncrements = Object.values(LiquidityManagerWorkers).reduce((acc, worker, i) => {
    acc[worker] = i + 20;
    return acc;
  }, {} as Record<LiquidityManagerWorkers, number>);

  async getSettings(): Promise<ClusterSettings> {
    return {
      clusterId: 'liquidityManagers',
      appRole: 'liquidityManager',
      restartDelay: 1000,
    };
  }

  async getWorkersSettings(): Promise<WorkerSettings[]> {
    const liquidityManagers = await this.liquidityManagersService.getEnabled();
    return liquidityManagers.map(lm => ({
      workerId: lm.worker,
      portIncrement: this.portIncrements[lm.worker],
    }));
  }

  async onWorkerListening(worker: WorkerSettings) {
    this.eventLogsService.operationalLog({
      action: 'runService',
      entity: 'Liquidity Manager',
      entityId: worker.workerId,
      service: 'TID Main App',
    }).catch(e => {
      this.logger.error('Error while logging liquidity manager run');
      this.logger.error(e, e.stack);
    });
  }

  async onWorkerExit(worker: WorkerSettings, code: number, signal: string) {
    this.eventLogsService.operationalLog({
      action: 'stopService',
      entity: 'Liquidity Manager',
      entityId: worker.workerId,
      service: 'TID Main App',
      logLevel: LogLevel.WARNING,
      payload: {
        code,
        signal,
      },
    }).catch(e => {
      this.logger.error('Error while logging liquidity manager stop');
      this.logger.error(e, e.stack);
    });
  }
}
