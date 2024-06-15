import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { EventLogsService } from './event-logs.service';
import { EventLog } from './entities/event-log.entity';
import { EventLogCreateDto } from './dto/event-log-create.dto';
import { EventLogUpdateDto } from "./dto/event-log-update.dto";
import { ManageEventLogsPolicy } from "./policies/manage-event-logs.policy";
import { ViewEventLogsPolicy } from "./policies/view-event-logs.policy";
import { CheckPolicies } from "../casl";

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
    join: {
      user: {
        allow: ['id', 'name'],
      },
    },
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewEventLogsPolicy()),
      ],
    },
  },
  dto: {
    create: EventLogCreateDto,
    update: EventLogUpdateDto,
  },
})
@CheckPolicies(new ManageEventLogsPolicy())
@ApiTags('EventLogs')
@Controller('event-logs')
export class EventLogsController implements CrudController<EventLog>{
  constructor(
    readonly service: EventLogsService,
  ) {}
}
