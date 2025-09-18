import { Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLog } from './entities/audit-log.entity';
import { CaslModule } from "@boarteam/boar-pack-users-backend/src/casl/casl.module";
import { CaslAbilityFactory } from "@boarteam/boar-pack-users-backend/src/casl/casl-ability.factory";
import { AuditLogsPermissions } from "./audit-logs.permissions";
import { Action } from "@boarteam/boar-pack-users-backend/src/casl/action.enum";
import { DataSource } from "typeorm";

@Module({})
export class AuditLogsModule {
  static forRoot(config: { dataSourceName: string }) {
    return {
      module: AuditLogsModule,
      imports: [
        CaslModule.forFeature(),
        TypeOrmModule.forFeature([AuditLog], config.dataSourceName),
      ],
      providers: [
        {
          provide: AuditLogsService,
          inject: [getDataSourceToken(config.dataSourceName)],
          useFactory: (dataSource: DataSource) => {
            return new AuditLogsService(dataSource.getRepository(AuditLog));
          }
        },
      ],
      exports: [
        AuditLogsService,
      ],
      controllers: [
        AuditLogsController,
      ]
    }
  }

  constructor() {
    CaslAbilityFactory.addPermissionToAction({
      permission: AuditLogsPermissions.VIEW,
      action: Action.Read,
      subject: AuditLog,
    });
    CaslAbilityFactory.addPermissionToAction({
      permission: AuditLogsPermissions.MANAGE,
      action: Action.Manage,
      subject: AuditLog,
    })
  }
}
