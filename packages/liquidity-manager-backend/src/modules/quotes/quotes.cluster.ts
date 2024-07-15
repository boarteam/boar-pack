import { Injectable } from "@nestjs/common";
import { ClusterInterface, ClusterSettings, WorkerSettings } from "@jifeon/boar-pack-common-backend";

@Injectable()
export class QuotesCluster implements ClusterInterface {
  constructor() {
  }

  async getSettings(): Promise<ClusterSettings> {
    return {
      clusterId: 'quotes',
      appRole: 'quotes',
      restartDelay: 1000,
    };
  }

  async getWorkersSettings(): Promise<WorkerSettings[]> {
    return [{
      workerId: 'quotes',
      portIncrement: 40,
    }];
  }
}
