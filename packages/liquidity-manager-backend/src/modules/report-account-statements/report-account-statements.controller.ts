import { BadRequestException, Controller, Get, Query, Req, UnauthorizedException } from '@nestjs/common';
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
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ): Promise<ReportAccountStatement | null> {
    const userId = Number(req.user?.id);

    if (isNaN(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }

    return this.service.getReport({
      userId,
      startTime,
      endTime,
    });
  }
}
