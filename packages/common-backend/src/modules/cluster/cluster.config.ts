import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cluster from "node:cluster";

export type TClusterConfig = {
  port: number;
  worker?: string;
  disableCluster?: boolean;
};

@Injectable()
export class ClusterConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TClusterConfig {
    const port = Number.parseInt(this.configService.getOrThrow<string>('PORT') || '');
    const worker = this.configService.get<string>('WORKER');
    const disableCluster = this.configService.get<string>('DISABLE_CLUSTER') === 'true';

    if (!port) {
      throw new Error('PORT env variable is not set');
    }

    if (cluster.isWorker && !worker) {
      throw new Error('WORKER env variable is not set');
    }

    return {
      port,
      worker,
      disableCluster,
    };
  }
}
