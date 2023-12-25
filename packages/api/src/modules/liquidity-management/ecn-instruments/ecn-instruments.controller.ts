import { Controller, UsePipes } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { EcnInstrumentsService } from './ecn-instruments.service';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { CheckPolicies } from '../../casl/policies.guard';
import { EcnInstrumentCreateDto } from './dto/ecn-instrument-create.dto';
import { EcnInstrumentUpdateDto } from './dto/ecn-instrument-update.dto';
import { ViewEcnInstrumentsPolicy } from './policies/view-ecn-instruments.policy';
import { ManageEcnInstrumentsPolicy } from './policies/manage-ecn-instruments.policy';
import { CRC64HashPipe } from '../hash_instrument.pipe';

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
@ApiTags('EcnInstruments')
@Controller('liquidity/ecn-instruments')
export class EcnInstrumentsController {
  constructor(
    private readonly service: EcnInstrumentsService,
  ) {}
}
