import { Controller, Get, Param } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { EcnSubscrSchemaService } from './ecn-subscr-schema.service';
import { EcnSubscrSchema } from './entities/ecn-subscr-schema.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { EcnSubscrSchemaCreateDto } from './dto/ecn-subscr-schema-create.dto';
import { EcnSubscrSchemaUpdateDto } from './dto/ecn-subscr-schema-update.dto';
import { ViewEcnSubscrSchemaPolicy } from './policies/view-ecn-subscr-schema.policy';
import { ManageEcnSubscrSchemaPolicy } from './policies/manage-ecn-subscr-schema.policy';

export class SubscSchemasCountResponse {
  data: number
}

@Crud({
  model: {
    type: EcnSubscrSchema,
  },
  params: {
    instrumentHash: {
      field: 'instrumentHash',
      type: 'string',
      primary: true,
    },
    connectSchemaId: {
      field: 'connectSchemaId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    join: {
      connectSchema: {},
      instrument: {},
      executionMode: {},
    }
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewEcnSubscrSchemaPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewEcnSubscrSchemaPolicy()),
      ],
    },
  },
  dto: {
    create: EcnSubscrSchemaCreateDto,
    update: EcnSubscrSchemaUpdateDto,
  },
})
@CheckPolicies(new ManageEcnSubscrSchemaPolicy())
@ApiTags('EcnSubscrSchemas')
@ApiExtraModels(SubscSchemasCountResponse)
@Controller('liquidity/ecn-subscr-schemas')
export class EcnSubscrSchemaController {
  constructor(
    public readonly service: EcnSubscrSchemaService,
  ) {}
  
    @Get('count/:connectSchemaId')
    @ApiOkResponse({
      schema: {
        $ref: getSchemaPath(SubscSchemasCountResponse),
      }
    })
    @CheckPolicies(new ViewEcnSubscrSchemaPolicy())
    async getCount(@Param('connectSchemaId') connectSchemaId: number) {
      return await this.service.count({
        where: {
          connectSchema: {
            id: Number(connectSchemaId),
          },
        },
      });
    }
}
