import { Controller } from '@nestjs/common';
import { EcnModuleTypesService } from './ecn-module-types.service';
import { Crud } from '@nestjsx/crud';
import { EcnModuleType } from './entities/ecn-module-type.entity';
import { CheckPolicies } from '../../casl/policies.guard';
import { EcnModuleTypeCreateDto } from './dto/ecn-module-type-create.dto';
import { ApiTags } from '@nestjs/swagger';
import { EcnModuleTypeUpdateDto } from "./dto/ecn-module-type-update.dto";
import { ViewEcnModuleTypesPolicy } from "./policies/view-ecn-module-types.policy";
import { ManageEcnModuleTypesPolicy } from "./policies/manage-ecn-module-types.policy";

@Crud({
  model: {
    type: EcnModuleType,
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
        CheckPolicies(new ViewEcnModuleTypesPolicy()),
      ],
    },
  },
  dto: {
    create: EcnModuleTypeCreateDto,
    update: EcnModuleTypeUpdateDto,
  },
})
@CheckPolicies(new ManageEcnModuleTypesPolicy())
@ApiTags('EcnModuleTypes')
@Controller('ecn-module-types')
export class EcnModuleTypesController {
  constructor(
    private readonly service: EcnModuleTypesService,
  ) {}
}
