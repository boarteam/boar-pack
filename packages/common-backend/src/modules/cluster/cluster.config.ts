import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cluster from 'node:cluster';

export type TClusterConfig = {
  port: number;
  worker?: string;
  disableCluster?: boolean;
};

// Port 0 is deliberately rejected: it means "let the OS pick a free port", but
// workers listen on `port + portIncrement`, so the base port has to be a real,
// predictable one.
const MIN_PORT = 1;
const MAX_PORT = 65535;

@Injectable()
export class ClusterConfigService {
  constructor(private configService: ConfigService) {}

  get config(): TClusterConfig {
    const rawPort = this.configService.get<string>('PORT')?.trim();
    const port = Number.parseInt(rawPort || '', 10);
    const worker = this.configService.get<string>('WORKER');
    const disableCluster = this.configService.get<string>('DISABLE_CLUSTER') === 'true';

    if (!disableCluster) {
      if (!rawPort) {
        throw new Error('PORT env variable is not set');
      }

      if (!/^\d+$/.test(rawPort) || port < MIN_PORT || port > MAX_PORT) {
        throw new Error(
          `PORT env variable is not a valid port number: "${rawPort}" ` +
            `(expected an integer between ${MIN_PORT} and ${MAX_PORT})`,
        );
      }

      if (cluster.isWorker && !worker) {
        throw new Error('WORKER env variable is not set');
      }
    }

    return {
      port,
      worker,
      disableCluster,
    };
  }
}
