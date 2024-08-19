import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { LiquidityManager, LiquidityManagerWorkers } from './entities/liquidity-manager.entity';
import { Repository } from 'typeorm';
import { LiquidityManagerCheckDto, LiquidityManagerConnectionStatus } from "./dto/liquidity-manager-check.dto";
import mysql from 'mysql2/promise';
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { ScryptService } from "@jifeon/boar-pack-common-backend";
import { TUser } from "@jifeon/boar-pack-users-backend";

@Injectable()
export class LiquidityManagersService extends TypeOrmCrudService<LiquidityManager> {
  private readonly logger = new Logger(LiquidityManagersService.name);

  constructor(
    readonly repo: Repository<LiquidityManager>,
    private readonly scryptService: ScryptService,
  ) {
    super(repo);
  }

  async checkConnection(checkDto: LiquidityManagerCheckDto) {
    let liquidityManager: LiquidityManager | null | undefined;
    if (checkDto.id) {
      liquidityManager = await this.repo.findOne({
        where: {
          id: checkDto.id,
        },
      });
    }

    let connection: mysql.Connection | undefined;
    try {
      const password = checkDto.pass || liquidityManager?.pass && await this.scryptService.decrypt(liquidityManager.pass);
      if (!password) {
        return {
          status: LiquidityManagerConnectionStatus.DISCONNECTED,
          message: 'Connection failed, check your credentials',
        }
      }

      const params = {
        host: checkDto.host,
        port: checkDto.port,
        user: checkDto.user,
        password,
        database: checkDto.database,
      };
      connection = await mysql.createConnection(params);

      await connection.connect();
      await connection.end();

      return {
        status: LiquidityManagerConnectionStatus.CONNECTED,
        message: 'Connection successful',
      }
    } catch (e) {
      this.logger.error('Error while checking connection');
      this.logger.error(e, e.stack);
      return {
        status: LiquidityManagerConnectionStatus.DISCONNECTED,
        message: 'Connection failed, check your credentials',
      }
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  getEnabled(): Promise<LiquidityManager[]> {
    return this.repo.find({
      where: {
        enabled: true,
      },
      order: {
        name: 'ASC',
      }
    });
  }

  async getDbConnectionForWorker(
    worker?: LiquidityManagerWorkers
  ): Promise<Pick<MysqlConnectionOptions, 'host' | 'port' | 'username' | 'password' | 'database'>> {
    const liquidityManager = await this.repo.findOneOrFail({
      where: {
        worker,
      },
    });

    return {
      host: liquidityManager.host,
      port: liquidityManager.port,
      username: liquidityManager.user,
      password: await this.scryptService.decrypt(liquidityManager.pass),
      database: liquidityManager.database,
    };
  }

  getEnabledForUser(id: TUser['id']) {
    return this.repo.find({
      relations: ['lmUsers'],
      where: {
        enabled: true,
        lmUsers: {
          userId: id,
        },
      },
      order: {
        name: 'ASC',
      }
    });
  }
}
