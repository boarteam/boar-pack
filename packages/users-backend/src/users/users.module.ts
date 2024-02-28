import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, User } from './entities/user.entity';
import { MeController } from './me.controller';
import { CaslModule } from '../casl/casl.module';
import { UsersConfigService } from "./users.config";
import BcryptService from "./bcrypt.service";
import { TModuleConfig } from "../app/app.types";
import { ConfigModule } from "@nestjs/config";
import { TID_DB_NAME } from "../app/tid-typeorm.config";

@Module({})
export class UsersModule implements OnModuleInit {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: UsersModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User], TID_DB_NAME),
        CaslModule
      ],
      providers: [
        UsersService,
        UsersConfigService,
        BcryptService,
      ],
      exports: [UsersService, BcryptService],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [UsersController, MeController];
    }

    return dynamicModule;
  }

  private readonly logger = new Logger(UsersModule.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
  ) {}

  async onModuleInit() {
    const usersCount = await this.usersService.count();
    if (!usersCount) {
      this.logger.log('Creating default admin user');
      await this.usersService.create({
        name: 'Admin',
        email: 'admin@admirals.com',
        role: Roles.ADMIN,
        pass: await this.bcryptService.hashPassword('pass'),
      });
    }
  }
}
