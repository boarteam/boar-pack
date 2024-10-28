import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudAuth } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { SubloginsSettingsService } from '../sublogin-settings/sublogins-settings.service';
import { CheckPolicies, TUser } from "@jifeon/boar-pack-users-backend";
import { ViewMySubloginSettingsPolicy } from './policies/view-my-sublogin-settings.policy';
import { ManageMySubloginSettingsPolicy } from './policies/manage-my-sublogin-settings.policy';
import { SubloginSettingsCreateDto } from "../sublogin-settings/dto/sublogin-settings-create.dto";
import { SubloginSettingsUpdateDto } from "../sublogin-settings/dto/sublogin-settings-update.dto";
import { SubloginSettings } from "../sublogin-settings/entities/sublogin-settings.entity";
import { MySubloginSettingsGuard } from './my-sublogin-settings.guard';

@Crud({
  model: {
    type: SubloginSettings,
  },
  params: {
    usersSubAccountInstId: {
      field: 'usersSubAccountInstId',
      type: 'string',
      primary: true,
    },
    instrument: {
      field: 'instrument',
      type: 'string',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    exclude: ['usersSubAccountInstId'],
    join: {
      usersSubAccountInst: {},
      instrumentRel: {},
      'instrumentRel.instrumentGroup': {},
      hedgeCurrency: {
        exclude: ['name'],
      },
    },
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    updateOneBase: {
      decorators: [
        UseGuards(MySubloginSettingsGuard),
      ],
    },
    deleteOneBase: {
      decorators: [
        UseGuards(MySubloginSettingsGuard),
      ],
    },
    createOneBase: {
      decorators: [
        UseGuards(MySubloginSettingsGuard),
      ],
    },
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewMySubloginSettingsPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewMySubloginSettingsPolicy()),
      ],
    },
  },
  dto: {
    create: SubloginSettingsCreateDto,
    update: SubloginSettingsUpdateDto,
  },
})
// todo: andrey help
// @CrudAuth({
//   property: 'user',
//   filter: (user: TUser) => {
//     return {
//     'usersSubAccountInst.id': user.id,
//   }},
// })
@ApiTags('mySubloginSettings')
@CheckPolicies(new ManageMySubloginSettingsPolicy())
@Controller('liquidity/my-sublogins-settings')
export class MySubloginsSettingsController {
  constructor(private readonly service: SubloginsSettingsService) {}
}
