import { Injectable } from "@nestjs/common";
import { LiquidityManagersService } from "./liquidity-managers.service";
import { LiquidityManagerWorkers } from "./entities/liquidity-manager.entity";
import { ClusterInterface, ClusterService, ClusterSettings, WorkerSettings } from "@jifeon/boar-pack-common-backend";

@Injectable()
export class LiquidityManagersCluster implements ClusterInterface {
  constructor(
    private readonly cluster: ClusterService,
    private readonly liquidityManagersService: LiquidityManagersService,
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
}
