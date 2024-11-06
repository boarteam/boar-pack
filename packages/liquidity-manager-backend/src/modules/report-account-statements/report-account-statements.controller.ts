import { BadRequestException, Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { ReportAccountStatementsService } from './report-account-statements.service';
import { ReportAccountStatement } from './entities/report-account-statement.entity';
import { ViewReportAccountStatementsPolicy } from "./policies/view-report-account-statements.policy";
import { Request } from 'express';

@CheckPolicies(new ViewReportAccountStatementsPolicy())
@ApiTags('ReportAccountStatements')
@Controller('liquidity/report-account-statements')
export class ReportAccountStatementsController implements CrudController<ReportAccountStatement>{
  constructor(
    readonly service: ReportAccountStatementsService,
  ) {}

  @Get('report')
  @ApiOkResponse({
    type: ReportAccountStatement,
  })
  getReport(
    @Req() req: Request,
  ): Promise<ReportAccountStatement | null> {
    const userId = Number(req.user?.id);

    if (isNaN(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }

    return this.service.getReport({
      userId,
      startTime: '2024-10-01 00:00:00',
      endTime: '2024-10-03 00:00:00',
    });
  }
}
