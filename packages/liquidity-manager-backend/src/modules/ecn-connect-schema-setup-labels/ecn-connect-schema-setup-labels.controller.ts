import { Controller, Post, UsePipes } from '@nestjs/common';
import { EcnConnectSchemaSetupLabelsService } from './ecn-connect-schema-setup-labels.service';
import { Crud } from '@nestjsx/crud';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ViewEcnConnectSchemaSetupLabelsPolicy } from './policies/view-ecn-connect-schema-setup-labels.policy';
import { ManageEcnConnectSchemaSetupLabelsPolicy } from './policies/manage-ecn-connect-schema-setup-labels.policy';
import { UniqueIdPipe } from '../../tools/unique-id.pipe';
import { AutoincrementIdPipe } from '../../tools/autoincrement_id.pipe';
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';
import { EcnConnectSchemaSetupLabelCreateDto } from './dto/ecn-connect-schema-setup-label-create.dto';
import { EcnConnectSchemaSetupLabelUpdateDto } from './dto/ecn-connect-schema-setup-label-update.dto';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ManageEcnConnectSchemaPolicy } from '../ecn-connect-schema/policies/manage-ecn-connect-schema.policy';

@Crud({
  model: {
    type: EcnConnectSchemaSetupLabel,
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
      modules: {},
      // this field is not in the Entity, refer to the service to understand the logic
      'modules.connections': {},
      // this field is not in the Entity, refer to the service to understand the logic
      'modules.connections.subscrSchemas': {},
    },
  },
  routes: {
    only: [
      'getOneBase',
      'getManyBase',
      'createOneBase',
      'updateOneBase',
      'deleteOneBase',
    ],
    getOneBase: {
      decorators: [CheckPolicies(new ViewEcnConnectSchemaSetupLabelsPolicy())],
    },
    getManyBase: {
      decorators: [CheckPolicies(new ViewEcnConnectSchemaSetupLabelsPolicy())],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          UniqueIdPipe(EcnConnectSchemaSetupLabel),
          AutoincrementIdPipe({ Entity: EcnConnectSchemaSetupLabel }),
        ),
      ],
    },
  },
  dto: {
    create: EcnConnectSchemaSetupLabelCreateDto,
    update: EcnConnectSchemaSetupLabelUpdateDto,
  },
})
@CheckPolicies(new ManageEcnConnectSchemaSetupLabelsPolicy())
@ApiTags('EcnConnectSchemaSetupLabels')
@Controller('liquidity/ecn-connect-schema-setup-labels')
export class EcnConnectSchemaSetupLabelsController {
  constructor(private readonly service: EcnConnectSchemaSetupLabelsService) {}

  @Post('generate-setups')
  @ApiOkResponse()
  @CheckPolicies(new ManageEcnConnectSchemaPolicy())
  async generateSetups(): Promise<void> {
    return this.service.generateSetups();
  }
}
