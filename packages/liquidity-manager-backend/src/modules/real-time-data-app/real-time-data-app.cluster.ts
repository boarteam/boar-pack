import { Injectable } from "@nestjs/common";
import { ClusterInterface, ClusterSettings, WorkerSettings } from "@jifeon/boar-pack-common-backend";

@Injectable()
export class RealTimeDataAppCluster implements ClusterInterface {
  constructor() {
  }

  async getSettings(): Promise<ClusterSettings> {
    return {
      clusterId: 'realTimeData',
      appRole: 'realTimeData',
      restartDelay: 1000,
    };
  }

  async getWorkersSettings(): Promise<WorkerSettings[]> {
    return [{
      workerId: 'realTimeData',
      portIncrement: 40,
    }];
  }
}
