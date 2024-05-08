import { BadRequestException, Controller, Req, UsePipes } from '@nestjs/common';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { EcnConnectSchemaService } from './ecn-connect-schema.service';
import { EcnConnectSchema } from './entities/ecn-connect-schema.entity';
import { EcnConnectSchemaCreateDto } from './dto/ecn-connect-schema-create.dto';
import { EcnConnectSchemaUpdateDto } from './dto/ecn-connect-schema-update.dto';
import { ViewEcnConnectSchemaPolicy } from './policies/view-ecn-connect-schema.policy';
import { ManageEcnConnectSchemaPolicy } from './policies/manage-ecn-connect-schema.policy';
import { UniqueIdPipe } from '../../tools/unique-id.pipe';
import { AutoincrementIdPipe } from '../../tools/autoincrement_id.pipe';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";

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
      'fromModule.setupLabels': {
        alias: 'fromModuleSetupLabels',
      },
      toModule: {},
      'toModule.setupLabels': {
        alias: 'toModuleSetupLabels',
      },
      subscrSchemas: {},
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
      decorators: [CheckPolicies(new ViewEcnConnectSchemaPolicy())],
    },
    getManyBase: {
      decorators: [CheckPolicies(new ViewEcnConnectSchemaPolicy())],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          UniqueIdPipe(EcnConnectSchema),
          AutoincrementIdPipe({ Entity: EcnConnectSchema }),
        ),
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
  constructor(private readonly service: EcnConnectSchemaService) {}

  @Override()
  async createOne(
    @Req() req: any,
    @ParsedRequest() crudRequest: CrudRequest,
    @ParsedBody() dto: EcnConnectSchemaCreateDto,
  ) {
    const existingConnection = await this.service.findOne({
      where: {
        fromModuleId: dto.fromModuleId,
        toModuleId: dto.toModuleId,
      },
    });

    if (existingConnection) {
      throw new BadRequestException(
        'A connection with these properties already exists.',
      );
    }

    return this.service.createOne(crudRequest, dto);
  }
}
