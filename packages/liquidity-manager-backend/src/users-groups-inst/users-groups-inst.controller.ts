import { Controller, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { UsersGroupsInstService } from './users-groups-inst.service';
import { UsersGroupsInst } from './entities/users-groups-inst.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { UsersGroupsInstCreateDto } from './dto/users-groups-inst-create.dto';
import { UsersGroupsInstUpdateDto } from './dto/users-groups-inst-update.dto';
import { ViewUsersGroupsInstPolicy } from './policies/view-users-groups-inst.policy';
import { ManageUsersGroupsInstPolicy } from './policies/manage-users-groups-inst.policy';
import { UniqueIdPipe } from '../tools/unique-id.pipe';
import { AutoincrementIdPipe } from '../tools/autoincrement_id.pipe';

@Crud({
  model: {
    type: UsersGroupsInst,
  },
  params: {
    name: {
      field: 'name',
      type: 'string',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    join: {
      action: {},
      company: {},
      currency: {},
      workingMode: {},
    },
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersGroupsInstPolicy()),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          UniqueIdPipe(UsersGroupsInst),
          AutoincrementIdPipe({ Entity: UsersGroupsInst }),
        ),
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
  constructor(private readonly service: UsersGroupsInstService) {
  }
}
