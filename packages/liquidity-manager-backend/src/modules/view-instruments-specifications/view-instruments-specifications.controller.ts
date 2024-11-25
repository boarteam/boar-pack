import { Controller } from '@nestjs/common';
import { Crud, CrudAuth } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { ViewInstrumentsSpecificationsService } from './view-instruments-specifications.service';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ViewViewInstrumentsSpecificationsPolicy } from './policies/view-view-instruments-specifications.policy';
import { AMTSUser } from "../auth";

@Crud({
  model: {
    type: ViewInstrumentsSpecification,
  },
  params: {
    instrument: {
      field: 'instrument',
      type: 'string',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
  },
  routes: {
    only: ['getOneBase', 'getManyBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewViewInstrumentsSpecificationsPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewViewInstrumentsSpecificationsPolicy()),
      ],
    },
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: AMTSUser) => ({
    'fromModuleId': user.marginModuleId,
  }),
})
@ApiTags('viewInstrumentsSpecifications')
@Controller('liquidity/view-instruments-specifications')
export class ViewInstrumentsSpecificationsController {
  constructor(
    private readonly service: ViewInstrumentsSpecificationsService,
  ) {}
}
