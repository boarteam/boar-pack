import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { EMAIL_UNIQUE_CONSTRAINT, Roles, User } from './entities/user.entity';
import { MeController } from './me.controller';
import { Action, CaslAbilityFactory, CaslModule } from '../casl';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Tools } from "@boarteam/boar-pack-common-backend";
import { VIEW_USERS } from "./users.constants";
import { DataSource } from "typeorm";
import { BcryptModule } from "../bcrypt/bcrypt.module";
import BcryptService from "../bcrypt/bcrypt.service";
import { UsersConfigService } from "./users.config";

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
        BcryptModule,
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
      ],
      exports: [UsersService],
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
    private readonly configService: ConfigService,
  ) {
    Tools.TypeOrmExceptionFilter.setUniqueConstraintMessage(EMAIL_UNIQUE_CONSTRAINT, 'User with this email already exists');
    CaslAbilityFactory.addPermissionToAction({
      permission: VIEW_USERS,
      action: Action.Read,
      subject: User,
    })
  }

  async onModuleInit() {
    if (this.configService.get('SWAGGER') === 'true') {
      return;
    }

    const usersCount = await this.usersService.count();
    if (!usersCount) {
      this.logger.log('Creating default admin user');
      await this.usersService.create({
        name: 'Admin',
        email: 'test-admin@test.test',
        role: Roles.ADMIN,
        pass: await this.bcryptService.hashPassword('test'),
      });
    }
  }
}
