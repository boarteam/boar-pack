import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { EcnConnectSchemaService } from './ecn-connect-schema.service';
import { EcnConnectSchema } from './entities/ecn-connect-schema.entity';
import { CheckPolicies } from '../../casl/policies.guard';
import { EcnConnectSchemaCreateDto } from './dto/ecn-connect-schema-create.dto';
import { EcnConnectSchemaUpdateDto } from './dto/ecn-connect-schema-update.dto';
import { ViewEcnConnectSchemaPolicy } from './policies/view-ecn-connect-schema.policy';
import { ManageEcnConnectSchemaPolicy } from './policies/manage-ecn-connect-schema.policy';

@Crud({
  model: {
    type: EcnConnectSchema,
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
      fromModule: {},
      toModule: {},
    }
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewEcnConnectSchemaPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ManageEcnConnectSchemaPolicy()),
      ],
    },
  },
  dto: {
    create: EcnConnectSchemaCreateDto,
    update: EcnConnectSchemaUpdateDto,
  },
})
@CheckPolicies(new ManageEcnConnectSchemaPolicy())
@ApiTags('EcnConnectSchemas')
@Controller('liquidity/ecn-connect-schemas')
export class EcnConnectSchemaController {
  constructor(
    private readonly service: EcnConnectSchemaService,
  ) {}
}
