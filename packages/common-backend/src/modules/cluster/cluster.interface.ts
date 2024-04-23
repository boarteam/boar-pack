export interface WorkerSettings {
  workerId: string;
  portIncrement: number;
}

export interface ClusterSettings {
  clusterId: string;
  appRole: string;
  restartDelay?: number;
}

export interface ClusterInterface {
  getSettings(): Promise<ClusterSettings>;
  getWorkersSettings(): Promise<WorkerSettings[]>;
}
