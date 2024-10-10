import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudAuth, CrudController } from '@nestjsx/crud';
import { CheckPolicies, TUser } from "@jifeon/boar-pack-users-backend";
import { ViewMyInstrumentsPolicy } from "./policies/view-my-instruments.policy";
import { EcnInstrument } from "../ecn-instruments/entities/ecn-instrument.entity";
import { EcnInstrumentsService } from "../ecn-instruments/ecn-instruments.service";

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
      subscriptions: {
        eager: true,
        select: false,
        required: true,
      },
      'subscriptions.connectSchema': {
        eager: true,
        select: false,
        required: true,
        alias: 'connectSchema',
      },
      'subscriptions.connectSchema.fromModule': {
        eager: true,
        select: false,
        required: true,
        alias: 'fromModule',
      },
      'subscriptions.connectSchema.fromModule.accessForUsers': {
        eager: true,
        select: false,
        required: true,
      },
      'subscriptions.connectSchema.toModule': {
        eager: true,
        select: false,
        required: true,
        alias: 'toModule',
      },
      'subscriptions.connectSchema.toModule.marginForUsers': {
        eager: true,
        required: true,
        select: false,
      },
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
    only: ['getManyBase'],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: TUser) => ({
    'subscriptions.connectSchema.fromModule.accessForUsers.id': user.id,
    'subscriptions.connectSchema.toModule.marginForUsers.id': user.id,
  }),
})
@CheckPolicies(new ViewMyInstrumentsPolicy())
@ApiTags('Instruments')
@Controller('liquidity/my-instruments')
export class MyInstrumentsController implements CrudController<EcnInstrument> {
  constructor(
    readonly service: EcnInstrumentsService,
  ) {
  }
}
