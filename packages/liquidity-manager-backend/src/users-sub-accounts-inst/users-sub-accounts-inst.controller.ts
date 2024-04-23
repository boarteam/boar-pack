import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { UsersSubAccountsInstService } from './users-sub-accounts-inst.service';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ViewUsersSubAccountsInstPolicy } from './policies/view-users-sub-accounts-inst.policy';
import { ManageUsersSubAccountsInstPolicy } from './policies/manage-users-sub-accounts-inst.policy';
import { UsersSubAccountInst } from "./entities/users-sub-account-inst.entity";
import { UsersSubAccountInstCreateDto } from "./dto/users-sub-account-inst-create.dto";
import { UsersSubAccountInstUpdateDto } from "./dto/users-sub-account-inst-update.dto";
import { AutoincrementIdPipe } from "../tools/autoincrement_id.pipe";
import { TypeOrmExceptionFilter } from "@jifeon/boar-pack-common-backend/src/tools";

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
        CheckPolicies(new ViewUsersSubAccountsInstPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersSubAccountsInstPolicy()),
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
@ApiTags('UsersSubAccountsInst')
@CheckPolicies(new ManageUsersSubAccountsInstPolicy())
@UseFilters(TypeOrmExceptionFilter)
@Controller('liquidity/users-sub-accounts-inst')
export class UsersSubAccountsInstController {
  constructor(private readonly service: UsersSubAccountsInstService) {}
}
