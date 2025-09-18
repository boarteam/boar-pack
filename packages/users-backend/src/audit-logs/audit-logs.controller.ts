import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@dataui/crud';
import { CheckPolicies } from "@boarteam/boar-pack-users-backend";
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';
import { ViewAuditLogsPolicy } from "./policies/view-audit-logs.policy";

@Crud({
  model: {
    type: AuditLog,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    join: {
      user: {
        allow: ['id', 'name'],
      }
    }
  },
  routes: {
    only: ['getManyBase'],
  },
})
@CheckPolicies(new ViewAuditLogsPolicy())
@ApiTags('AuditLogs')
@Controller('audit-logs')
export class AuditLogsController implements CrudController<AuditLog>{
  constructor(
    readonly service: AuditLogsService,
  ) {}
}
