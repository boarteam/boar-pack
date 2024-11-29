import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { EMAIL_UNIQUE_CONSTRAINT, Roles, User } from './entities/user.entity';
import { MeController } from './me.controller';
import { Action, CaslAbilityFactory, CaslModule } from '../casl';
import { UsersConfigService } from "./users.config";
import BcryptService from "./bcrypt.service";
import { ConfigModule } from "@nestjs/config";
import { Tools } from "@boarteam/boar-pack-common-backend";
import { VIEW_USERS } from "./users.constants";
import { DataSource } from "typeorm";

@Module({})
export class UsersModule implements OnModuleInit {
  static register(config: {
    withControllers?: boolean;
    dataSourceName?: string;
  } = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: UsersModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User], config.dataSourceName),
        CaslModule.forFeature(),
      ],
      providers: [
        {
          provide: UsersService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new UsersService(dataSource.getRepository(User));
          }
        },
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
  ) {
    Tools.TypeOrmExceptionFilter.setUniqueConstraintMessage(EMAIL_UNIQUE_CONSTRAINT, 'User with this email already exists');
    CaslAbilityFactory.addPermissionToAction({
      permission: VIEW_USERS,
      action: Action.Read,
      subject: User,
    })
  }

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
