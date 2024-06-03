import { Controller, Get, Param, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UsersInstService } from './users-inst.service';
import { UsersInst } from './entities/users-inst.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { UsersInstCreateDto } from './dto/users-inst-create.dto';
import { UsersInstUpdateDto } from './dto/users-inst-update.dto';
import { ViewUsersInstPolicy } from './policies/view-users-inst.policy';
import { ManageUsersInstPolicy } from './policies/manage-users-inst.policy';
import { UniqueIdPipe } from "../../tools/unique-id.pipe";
import { AutoincrementIdPipe } from "../../tools/autoincrement_id.pipe";
import { PasswordInterceptor } from "./password-interceptor.service";
import { UsersInstAuthService } from "./users-inst-auth.service";
import { UsersInstResetPassDto } from "./dto/users-inst-reset-pass.dto";

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
      pwdHashType: {},
    },
    exclude: ['password'],
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewUsersInstPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewUsersInstPolicy()),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          UniqueIdPipe(UsersInst),
          AutoincrementIdPipe({ Entity: UsersInst }),
        ),
      ],
      interceptors: [
        PasswordInterceptor,
      ],
    },
    updateOneBase: {
      interceptors: [
        PasswordInterceptor,
      ],
    },
  },
  dto: {
    create: UsersInstCreateDto,
    update: UsersInstUpdateDto,
  },
})
@ApiTags('UsersInst')
@ApiExtraModels(UsersInstResetPassDto)
@CheckPolicies(new ManageUsersInstPolicy())
@Controller('liquidity/users-inst')
export class UsersInstController {
  constructor(
    private readonly service: UsersInstService,
    private readonly userInstAuthService: UsersInstAuthService,
  ) {
  }

  @Get('reset-password-uri/:userId')
  generateResetPasswordLink(@Param('userId') userId: string): UsersInstResetPassDto {
    const resetUri = this.userInstAuthService.generatePasswordResetUrl(userId);
    return { resetUri };
  }
}
