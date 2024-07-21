import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ClusterService } from "./cluster.service";
import { nextTick } from "process";
import { ConfigModule } from "@nestjs/config";
import { ClusterConfigService, TClusterConfig } from "./cluster.config";

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    ClusterConfigService,
    ClusterService,
  ],
  exports: [
    ClusterService,
    ClusterConfigService,
  ],
})
export class ClusterModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(ClusterModule.name);
  private config: TClusterConfig;

  constructor(
    private readonly clusterService: ClusterService,
    private readonly configService: ClusterConfigService,
  ) {
    this.config = configService.config;
  }

  async onApplicationBootstrap() {
    if (this.config.disableCluster) {
      this.logger.debug('Cluster is disabled');
      return;
    }

    // We need to wait for event emitter to be initialized else broadcast will not work
    nextTick(async () => {
      try {
        await this.clusterService.runClusters();
      } catch (e) {
        this.logger.error('Error while running clusters');
        this.logger.error(e, e.stack);
      }
    });
  }
}
