import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { EcnInstrumentsGroupsService } from './ecn-instruments-groups.service';
import { EcnInstrumentsGroup } from './entities/ecn-instruments-group.entity';
import { EcnInstrumentsGroupCreateDto } from './dto/ecn-instruments-group-create.dto';
import { EcnInstrumentsGroupUpdateDto } from './dto/ecn-instruments-group-update.dto';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ViewEcnInstrumentsGroupsPolicy } from './policies/view-ecn-instruments-groups.policy';
import { ManageEcnInstrumentsGroupsPolicy } from './policies/manage-ecn-instruments-groups.policy';

@Crud({
  model: {
    type: EcnInstrumentsGroup,
  },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewEcnInstrumentsGroupsPolicy()),
      ],
    },
  },
  dto: {
    create: EcnInstrumentsGroupCreateDto,
    update: EcnInstrumentsGroupUpdateDto,
  },
})
@CheckPolicies(new ManageEcnInstrumentsGroupsPolicy())
@ApiTags('EcnInstrumentsGroups')
@Controller('liquidity/ecn-instruments-groups')
export class EcnInstrumentsGroupsController {
  constructor(public service: EcnInstrumentsGroupsService) {}
}
