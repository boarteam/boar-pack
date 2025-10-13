import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Crud } from '@dataui/crud';
import { User } from './entities/user.entity';
import { Action, CheckPolicies } from '../casl';
import { UserCreateDto } from './dto/user-create.dto';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserUpdateDto } from "./dto/user-update.dto";
import { HashPasswordInterceptor } from "./hash-password.interceptor";
import { PermissionDto } from "./dto/permission.dto";
import { UsersEditingGuard } from "./users-editing.guard";
import { ViewUsersPolicy } from "./policies/view-users.policy";
import { Tools } from "@boarteam/boar-pack-common-backend";
import { ManageUsersPolicy } from "./policies/manage-users.policy";
import { FieldsPermissionInterceptor } from "../casl/fields-permission.interceptor";

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
    softDelete: true
  },
  routes: {
    only: ['getManyBase', 'getOneBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersPolicy()),
      ],
      interceptors: [
        new FieldsPermissionInterceptor(User, Action.Read),
      ],
    },
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewUsersPolicy()),
      ],
      interceptors: [
        new FieldsPermissionInterceptor(User, Action.Read),
      ],
    },
    createOneBase: {
      interceptors: [
        HashPasswordInterceptor,
      ],
      decorators: [
        UseGuards(UsersEditingGuard),
      ]
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
@CheckPolicies(new ManageUsersPolicy())
@UseFilters(Tools.TypeOrmExceptionFilter)
@ApiTags('Users')
@ApiExtraModels(PermissionDto)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
}
