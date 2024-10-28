import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ViewInstrumentsSpecificationsService } from './view-instruments-specifications.service';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ViewViewInstrumentsSpecificationsPolicy } from './policies/view-view-instruments-specifications.policy';

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
    join: {
    }
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
@ApiTags('viewInstrumentsSpecifications')
@Controller('liquidity/view-instruments-specifications')
export class ViewInstrumentsSpecificationsController {
  constructor(
    private readonly service: ViewInstrumentsSpecificationsService,
  ) {}
}
