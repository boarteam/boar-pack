import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@dataui/crud';
import { UsersConnectionsHistory } from "./entities/users-connections-history.entity";
import { ViewUsersConnectionsHistory } from "./policies/view-users-connections-history";
import { UsersConnectionsHistoryService } from "./users-connections-history.service";
import { CheckPolicies } from "@boarteam/boar-pack-users-backend";

@Crud({
  model: {
    type: UsersConnectionsHistory,
  },
  query: {
    alwaysPaginate: true,
  },
  routes: {
    only: ['getManyBase'],
  },
})
@CheckPolicies(new ViewUsersConnectionsHistory())
@ApiTags('UsersConnectionsHistory')
@Controller('users-connections-history')
export class UsersConnectionsHistoryController implements CrudController<UsersConnectionsHistory> {
  constructor(
    readonly service: UsersConnectionsHistoryService,
  ) {
  }
}
