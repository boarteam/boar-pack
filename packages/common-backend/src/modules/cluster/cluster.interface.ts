export interface WorkerSettings {
  workerId: string;
  workerName?: string;
  portIncrement: number | null;
  port?: number | null;
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
  onWorkerRun?(worker: WorkerSettings, vars: Record<string, string>): void;
  onWorkerExit?(worker: WorkerSettings, code: number, signal: string): void;
  onWorkerListening?(worker: WorkerSettings): void;
}
