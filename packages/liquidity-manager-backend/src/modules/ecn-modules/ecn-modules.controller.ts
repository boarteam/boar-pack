import { Controller, UsePipes } from '@nestjs/common';
import { EcnModulesService } from './ecn-modules.service';
import { Crud } from '@nestjsx/crud';
import { EcnModule } from './entities/ecn-module.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { EcnModuleCreateDto } from './dto/ecn-module-create.dto';
import { ApiTags } from '@nestjs/swagger';
import { EcnModuleUpdateDto } from "./dto/ecn-module-update.dto";
import { ViewEcnModulesPolicy } from "./policies/view-ecn-modules.policy";
import { ManageEcnModulesPolicy } from "./policies/manage-ecn-modules.policy";
import { UniqueIdPipe } from "../../tools/unique-id.pipe";
import { AutoincrementIdPipe } from "../../tools/autoincrement_id.pipe";

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
      // this field is not in the Entity, refer to the service to understand the logic
      connections: {
        required: true,
        select: false,
      },
      // this field is not in the Entity, refer to the service to understand the logic
      'connections.subscrSchemas': {
        required: true,
        select: false,
      },
      type: {},
    }
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewEcnModulesPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewEcnModulesPolicy()),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          UniqueIdPipe(EcnModule),
          AutoincrementIdPipe({ Entity: EcnModule }),
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
