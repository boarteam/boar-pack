import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudAuth, CrudController } from '@nestjsx/crud';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ReportBalanceOperationsService } from './report-balance-operations.service';
import { ReportBalanceOperation } from './entities/report-balance-operation.entity';
import { ViewReportBalanceOperationsPolicy } from "./policies/view-report-balance-operations.policy";

@Crud({
  model: {
    type: ReportBalanceOperation,
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
  filter: (user) => {
    return {
      userId: user.id,
    };
  }
})
@CheckPolicies(new ViewReportBalanceOperationsPolicy())
@ApiTags('ReportBalanceOperations')
@Controller('report-balance-operations')
export class ReportBalanceOperationsController implements CrudController<ReportBalanceOperation> {
  constructor(
    readonly service: ReportBalanceOperationsService,
  ) {
  }
}
