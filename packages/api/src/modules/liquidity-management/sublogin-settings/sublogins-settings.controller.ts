import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { SubloginsSettingsService } from './sublogins-settings.service';
import { CheckPolicies } from '../../casl/policies.guard';
import { ViewSubloginSettingsPolicy } from './policies/view-users-sublogin-instruments-settings.policy';
import { ManageSubloginSettingsPolicy } from './policies/manage-users-sublogin-instruments-settings.policy';
import { SubloginSettingsCreateDto } from "./dto/sublogin-settings-create.dto";
import { SubloginSettingsUpdateDto } from "./dto/sublogin-settings-update.dto";
import { SubloginSettings } from "./entities/sublogin-settings.entity";

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
      hedgeCurrency: {
        exclude: ['name'],
      },
    },
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewSubloginSettingsPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewSubloginSettingsPolicy()),
      ],
    },
  },
  dto: {
    create: SubloginSettingsCreateDto,
    update: SubloginSettingsUpdateDto,
  },
})
@ApiTags('subloginSettings')
@CheckPolicies(new ManageSubloginSettingsPolicy())
@Controller('liquidity/sublogins-settings')
export class SubloginsSettingsController {
  constructor(private readonly service: SubloginsSettingsService) {}
}
