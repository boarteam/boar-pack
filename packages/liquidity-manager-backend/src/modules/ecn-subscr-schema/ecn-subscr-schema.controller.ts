import { Controller, Get, Param, Post, Req, Body, UseInterceptors, Delete } from '@nestjs/common';
import {
  Crud,
  CrudController,
  CrudRequest,
  CrudRequestInterceptor,
  GetManyDefaultResponse,
  ParsedRequest,
} from '@nestjsx/crud';
import { ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { EcnSubscrSchemaService } from './ecn-subscr-schema.service';
import { EcnSubscrSchema } from './entities/ecn-subscr-schema.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { EcnSubscrSchemaCreateDto } from './dto/ecn-subscr-schema-create.dto';
import { EcnSubscrSchemaUpdateDto } from './dto/ecn-subscr-schema-update.dto';
import { ViewEcnSubscrSchemaPolicy } from './policies/view-ecn-subscr-schema.policy';
import { ManageEcnSubscrSchemaPolicy } from './policies/manage-ecn-subscr-schema.policy';
import { Swagger } from '@nestjsx/crud/lib/crud';

export class SubscSchemasCountResponse {
  data: number;
}

class UpdateManyDto {
  updateValues: Partial<EcnSubscrSchema>;
  records: { connectSchemaId: EcnSubscrSchema['connectSchemaId'], instrumentHash: EcnSubscrSchema['instrumentHash'] }[];
}

class DeleteManyDto {
  records: { connectSchemaId: EcnSubscrSchema['connectSchemaId'], instrumentHash: EcnSubscrSchema['instrumentHash'] }[];
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
      'instrument.instrumentGroup': {},
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

    initSwagger(): void {
      const metadata = Swagger.getParams(this.updateMany);
      const queryParamsMeta = Swagger.createQueryParamsMeta('getManyBase', {
        model: {
          type: EcnSubscrSchema,
        },
        query: {},
      });
      Swagger.setParams([...metadata, ...queryParamsMeta], this.updateMany);
    }
  
    get base(): CrudController<EcnSubscrSchema> {
      return this;
    }

    @Post('updateMany')
    @UseInterceptors(CrudRequestInterceptor)
    @CheckPolicies(new ManageEcnSubscrSchemaPolicy())
    async updateMany(@Req() originReq: Request, @ParsedRequest() req: CrudRequest, @Body() body: UpdateManyDto) {
      let entitiesToUpdate = body.records;
      if (entitiesToUpdate.length === 0) {
        req.parsed.limit = 0;
        const response = await this.base.getManyBase?.(req) as GetManyDefaultResponse<EcnSubscrSchema>;
        entitiesToUpdate = response?.data;
      }

      return this.service.updateMany(entitiesToUpdate, body.updateValues);
    }

    @Delete('deleteMany')
    @UseInterceptors(CrudRequestInterceptor)
    @CheckPolicies(new ManageEcnSubscrSchemaPolicy())
    async deleteMany(@Req() originReq: Request, @ParsedRequest() req: CrudRequest, @Body() body: DeleteManyDto) {
      let entitiesToDelete = body.records;
      if (entitiesToDelete.length === 0) {
        req.parsed.limit = 0;
        const response = await this.base.getManyBase?.(req) as GetManyDefaultResponse<EcnSubscrSchema>;
        entitiesToDelete = response?.data;
      }

      return this.service.deleteMany(entitiesToDelete);
    }
}
