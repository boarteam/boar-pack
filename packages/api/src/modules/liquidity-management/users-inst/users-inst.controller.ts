import { Controller, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { UsersInstService } from './users-inst.service';
import { UsersInst } from './entities/users-inst.entity';
import { CheckPolicies } from '../../casl/policies.guard';
import { UsersInstCreateDto } from './dto/users-inst-create.dto';
import { UsersInstUpdateDto } from './dto/users-inst-update.dto';
import { ViewUsersInstPolicy } from './policies/view-users-inst.policy';
import { ManageUsersInstPolicy } from './policies/manage-users-inst.policy';
import { UniqueIdPipe } from "../unique-id.pipe";

@Crud({
  model: {
    type: UsersInst,
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
      module: {},
      marginModule: {},
      company: {},
      group: {},
      commissionType: {},
      commissionLotsMode: {},
      action: {},
    },
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersInstPolicy()),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(UniqueIdPipe(UsersInst)),
      ],
    },
  },
  dto: {
    create: UsersInstCreateDto,
    update: UsersInstUpdateDto,
  },
})
@ApiTags('UsersInst')
@CheckPolicies(new ManageUsersInstPolicy())
@Controller('users-inst')
export class UsersInstController {
  constructor(private readonly service: UsersInstService) {}
}
