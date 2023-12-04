import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { UsersGroupsInstService } from './users-groups-inst.service';
import { UsersGroupsInst } from './entities/users-groups-inst.entity';
import { CheckPolicies } from '../../casl/policies.guard';
import { UsersGroupsInstCreateDto } from './dto/users-groups-inst-create.dto';
import { UsersGroupsInstUpdateDto } from './dto/users-groups-inst-update.dto';
import { ViewUsersGroupsInstPolicy } from './policies/view-users-groups-inst.policy';
import { ManageUsersGroupsInstPolicy } from './policies/manage-users-groups-inst.policy';

@Crud({
  model: {
    type: UsersGroupsInst,
  },
  params: {
    id: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    join: {
      action: {},
      company: {},
    },
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersGroupsInstPolicy()),
      ],
    },
  },
  dto: {
    create: UsersGroupsInstCreateDto,
    update: UsersGroupsInstUpdateDto,
  },
})
@ApiTags('UsersGroupsInst')
@CheckPolicies(new ManageUsersGroupsInstPolicy())
@Controller('liquidity/users-groups-inst')
export class UsersGroupsInstController {
  constructor(private readonly service: UsersGroupsInstService) {}
}
