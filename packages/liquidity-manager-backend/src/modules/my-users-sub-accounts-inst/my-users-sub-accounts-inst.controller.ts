import { Controller, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Crud, CrudAuth } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { UsersSubAccountsInstService } from '../users-sub-accounts-inst/users-sub-accounts-inst.service';
import { CheckPolicies, TUser } from "@jifeon/boar-pack-users-backend";
import { ViewMyUsersSubAccountsInstPolicy } from './policies/view-my-users-sub-accounts-inst.policy';
import { ManageMyUsersSubAccountsInstPolicy } from './policies/manage-my-users-sub-accounts-inst.policy';
import { UsersSubAccountInst } from "../users-sub-accounts-inst/entities/users-sub-account-inst.entity";
import { UsersSubAccountInstCreateDto } from "../users-sub-accounts-inst/dto/users-sub-account-inst-create.dto";
import { UsersSubAccountInstUpdateDto } from "../users-sub-accounts-inst/dto/users-sub-account-inst-update.dto";
import { AutoincrementIdPipe } from "../../tools/autoincrement_id.pipe";
import { TypeOrmExceptionFilter } from "@jifeon/boar-pack-common-backend/src/tools";
import { MyUsersSubAccountsInstGuard } from './my-users-sub-accounts-inst.guard';

@Crud({
  model: {
    type: UsersSubAccountInst,
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
    join: {},
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewMyUsersSubAccountsInstPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewMyUsersSubAccountsInstPolicy()),
      ],
    },
    updateOneBase: {
      decorators: [
        UseGuards(MyUsersSubAccountsInstGuard),
      ],
    },
    deleteOneBase: {
      decorators: [
        UseGuards(MyUsersSubAccountsInstGuard),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          AutoincrementIdPipe({Entity: UsersSubAccountInst}),
          AutoincrementIdPipe({Entity: UsersSubAccountInst, idField: 'subAccountId', uniqueFields: ['userId']}),
        ),
      ],
    },
  },
  dto: {
    create: UsersSubAccountInstCreateDto,
    update: UsersSubAccountInstUpdateDto,
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: TUser) => ({
    userId: user.id,
  }),
})
@ApiTags('myUsersSubAccountsInst')
@CheckPolicies(new ManageMyUsersSubAccountsInstPolicy())
@UseFilters(TypeOrmExceptionFilter)
@Controller('liquidity/my-users-sub-accounts-inst')
export class MyUsersSubAccountsInstController {
    constructor(private readonly service: UsersSubAccountsInstService) {}
  }
