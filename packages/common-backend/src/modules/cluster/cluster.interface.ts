export interface WorkerSettings {
  workerId: string;
  workerName?: string;
  portIncrement: number | null;
  extraEnv?: Record<string, string>;
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
