import { Controller, Get, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudAuth, CrudController } from '@nestjsx/crud';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ReportSwapsService } from './report-swaps.service';
import { ReportSwap } from './entities/report-swap.entity';
import { ViewReportSwapsPolicy } from "./policies/view-report-swaps.policy";
import { Request } from 'express';

@Crud({
  model: {
    type: ReportSwap,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
  },
  routes: {
    only: ['getManyBase'],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user) => ({
    userId: user.id,
  }),
})
@CheckPolicies(new ViewReportSwapsPolicy())
@ApiTags('ReportSwaps')
@Controller('report-swaps')
export class ReportSwapsController implements CrudController<ReportSwap>{
  constructor(
    readonly service: ReportSwapsService,
  ) {}
}
