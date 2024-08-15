import { CanActivate, ExecutionContext, Injectable, Logger, } from '@nestjs/common';
import { LiquidityManagersUserRoles, LiquidityManagersUsersService } from '../liquidity-managers-users';
import { ClusterConfigService, TClusterConfig } from "@jifeon/boar-pack-common-backend";
import { LiquidityManagerWorkers } from "../liquidity-managers";
import { TUser } from "@jifeon/boar-pack-users-backend";

@Injectable()
export class LiquidityAppGuard implements CanActivate {
  private readonly logger = new Logger(LiquidityAppGuard.name);
  private readonly config: TClusterConfig;


  constructor(
    private readonly liquidityManagersUsers: LiquidityManagersUsersService,
    private readonly clusterConfigService: ClusterConfigService,
  ) {
    this.config = this.clusterConfigService.config;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let user: TUser;
    let method: string;
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      user = request.user;
      method = request.method;
    } else {
      throw new Error('Unknown context type');
    }

    if (!user) {
      throw new Error('User is not found in request, make sure that JWT guard is used before this guard');
    }

    const lmUser = await this.liquidityManagersUsers.findOne({
      where: {
        userId: user.id,
        liquidityManager: {
          worker: this.config.worker as LiquidityManagerWorkers,
        }
      },
      relations: ['liquidityManager']
    });

    if (!lmUser) {
      this.logger.warn(`User ${user.id} is not allowed to access liquidity manager ${this.config.worker}`);
      return false;
    }

    if (lmUser.role === LiquidityManagersUserRoles.MANAGER) {
      return true;
    }

    return method === 'GET';
  }
}
