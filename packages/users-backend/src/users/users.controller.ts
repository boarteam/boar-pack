import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Crud, Override, ParsedRequest, CrudRequest } from '@nestjsx/crud';
import { QueryFilter } from '@nestjsx/crud-request';
import { User } from './entities/user.entity';
import { CheckPolicies, ManageAllPolicy } from '../casl';
import { UserCreateDto } from './dto/user-create.dto';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserUpdateDto } from "./dto/user-update.dto";
import { HashPasswordInterceptor } from "./hash-password.interceptor";
import { PermissionDto } from "./dto/permission.dto";
import { UsersEditingGuard } from "./users-editing.guard";
import { ViewUsersPolicy } from "./policies/view-users.policy";
import { Tools } from "@jifeon/boar-pack-common-backend";

@Crud({
  model: {
    type: User,
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
    exclude: ['pass'],
    // @ts-ignore
    filter: {
      deletedAt: {
        $eq: null
      }
    },
  },
  routes: {
    only: ['getManyBase', 'getOneBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersPolicy()),
      ],
    },
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewUsersPolicy()),
      ],
    },
    createOneBase: {
      interceptors: [
        HashPasswordInterceptor,
      ],
    },
    updateOneBase: {
      interceptors: [
        HashPasswordInterceptor,
      ],
      decorators: [
        UseGuards(UsersEditingGuard),
      ]
    },
    deleteOneBase: {
      decorators: [
        UseGuards(UsersEditingGuard),
      ]
    }
  },
  dto: {
    create: UserCreateDto,
    update: UserUpdateDto,
  },
})
@CheckPolicies(new ManageAllPolicy())
@UseFilters(Tools.TypeOrmExceptionFilter)
@ApiTags('Users')
@ApiExtraModels(PermissionDto)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Override()
  async deleteOne(@ParsedRequest() req: CrudRequest) {
    const id = req.parsed.paramsFilter
        .find((f: QueryFilter) => f.field === 'id' && f.operator === '$eq')?.value;

    if (!id) {
      throw new Error("Can't find id value in the params filter request field");
    }

    return this.service.markDeleted(id);
  }
}
