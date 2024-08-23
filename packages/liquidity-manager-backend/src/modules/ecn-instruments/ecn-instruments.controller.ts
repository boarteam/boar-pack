import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiExtraModels, ApiOkResponse, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { EcnInstrumentsService } from './ecn-instruments.service';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { EcnInstrumentCreateDto } from './dto/ecn-instrument-create.dto';
import { EcnInstrumentUpdateDto } from './dto/ecn-instrument-update.dto';
import { ViewEcnInstrumentsPolicy } from './policies/view-ecn-instruments.policy';
import { ManageEcnInstrumentsPolicy } from './policies/manage-ecn-instruments.policy';
import { CRC64HashPipe } from '../../tools/hash_instrument.pipe';
import { GetEcnInstrumentsInConnectionsResponse, GetInstrumentsInConnectionsQueryDto } from './dto/ecn-instruments-get-in-connections.dto';

@Crud({
  model: {
    type: EcnInstrument,
  },
  params: {
    instrumentHash: {
      field: 'instrumentHash',
      type: 'string',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    join: {
      instrumentGroup: {},
      swapType: {},
      swapRollover3Days: {},
      commissionType: {},
      commissionLotsMode: {},
      commissionAgentType: {},
      commissionAgentLotsMode: {},
      profitMode: {},
      marginMode: {},
    }
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getOneBase: {
      decorators: [
        CheckPolicies(new ViewEcnInstrumentsPolicy()),
      ],
    },
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewEcnInstrumentsPolicy()),
      ],
    },
    createOneBase: {
      decorators: [
        UsePipes(
          CRC64HashPipe(EcnInstrument, 'name', 'instrumentHash'),
        ),
      ],
    },
  },
  dto: {
    create: EcnInstrumentCreateDto,
    update: EcnInstrumentUpdateDto,
  },
})
@CheckPolicies(new ManageEcnInstrumentsPolicy())
@ApiExtraModels(GetInstrumentsInConnectionsQueryDto)
@ApiExtraModels(GetEcnInstrumentsInConnectionsResponse)
@ApiTags('EcnInstruments')
@Controller('liquidity/ecn-instruments')
export class EcnInstrumentsController {
  constructor(
    private readonly service: EcnInstrumentsService,
  ) {}

  @Get('in-connections')
  @CheckPolicies(new ViewEcnInstrumentsPolicy())
  @ApiOkResponse({
    schema: {
      $ref: getSchemaPath(GetEcnInstrumentsInConnectionsResponse),
    }
  })
  getInConnections(
    @Query() query: GetInstrumentsInConnectionsQueryDto,
  ): Promise<GetEcnInstrumentsInConnectionsResponse> {
    return this.service.getInConnections(query);
  }
}
