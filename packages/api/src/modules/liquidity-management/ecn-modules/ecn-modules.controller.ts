import { Controller, UsePipes } from '@nestjs/common';
import { EcnModulesService } from './ecn-modules.service';
import { Crud } from '@nestjsx/crud';
import { EcnModule } from './entities/ecn-module.entity';
import { CheckPolicies } from '../../casl/policies.guard';
import { EcnModuleCreateDto } from './dto/ecn-module-create.dto';
import { ApiTags } from '@nestjs/swagger';
import { EcnModuleUpdateDto } from "./dto/ecn-module-update.dto";
import { ViewEcnModulesPolicy } from "./policies/view-ecn-modules.policy";
import { ManageEcnModulesPolicy } from "./policies/manage-ecn-modules.policy";
import { UniqueIdPipe } from "../unique-id.pipe";
import { AutoincrementIdPipe } from "../autoincrement_id.pipe";

@Crud({
  model: {
    type: EcnModule,
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
    join: {
      type: {
        exclude: ['id']
      },
    }
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewEcnModulesPolicy()),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          UniqueIdPipe(EcnModule),
          AutoincrementIdPipe(EcnModule),
        ),
      ],
    },
  },
  dto: {
    create: EcnModuleCreateDto,
    update: EcnModuleUpdateDto,
  },
})
@CheckPolicies(new ManageEcnModulesPolicy())
@ApiTags('EcnModules')
@Controller('liquidity/ecn-modules')
export class EcnModulesController {
  constructor(
    private readonly service: EcnModulesService,
  ) {
  }
}
