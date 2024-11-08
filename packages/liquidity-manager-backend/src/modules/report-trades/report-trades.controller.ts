import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudAuth, CrudController } from '@nestjsx/crud';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ReportTradesService } from './report-trades.service';
import { ReportTrade } from './entities/report-trade.entity';
import { ViewReportTradesPolicy } from "./policies/view-report-trades.policy";

@Crud({
  model: {
    type: ReportTrade,
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
    join: {
      // do not add joins here since it will force typeorm to create super uneficient queries
      // to calculate distinct values
    },
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
@CheckPolicies(new ViewReportTradesPolicy())
@ApiTags('ReportTrades')
@Controller('report-trades')
export class ReportTradesController implements CrudController<ReportTrade>{
  constructor(
    readonly service: ReportTradesService,
  ) {}
}
