import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudAuth, CrudController } from '@nestjsx/crud';
import { CheckPolicies, EventLog, EventLogsService, LogType, TUser } from "@jifeon/boar-pack-users-backend";
import { ViewMyAuditLogsPolicy } from "./policies/view-my-audit-logs.policy";

@Crud({
  model: {
    type: EventLog,
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
  },
  routes: {
    only: ['getManyBase'],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: TUser) => ({
    'externalUserId': user.id,
    'logType': LogType.AUDIT,
  }),
})
@CheckPolicies(new ViewMyAuditLogsPolicy())
@ApiTags('MyAuditLogs')
@Controller('my-audit-logs')
export class MyAuditLogsController implements CrudController<EventLog> {
  constructor(
    readonly service: EventLogsService,
  ) {
  }
}
