import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ViewQuotesStatisticPolicy } from "./policies/view-quotes-statistic";
import { CheckPolicies } from '@boarteam/boar-pack-users-backend';
import { QuotesStatisticDto } from "./dto/quotes-statistic.dto";
import { QuotesStatisticQueryDto } from "./dto/quotes-statistic-query.dto";
import { QuotesStatisticService } from "./quotes-statistic.service";

@CheckPolicies(new ViewQuotesStatisticPolicy())
@ApiTags('QuotesStatistics')
@ApiExtraModels(QuotesStatisticDto, QuotesStatisticQueryDto)
@Controller('quotes-statistic')
export class QuotesStatisticsController {
  constructor(
    readonly service: QuotesStatisticService,
  ) {}

  @Get('timeline')
  @ApiOkResponse({
    type: QuotesStatisticDto,
    isArray: true,
  })
  async getTimeline(
    @Query() query: QuotesStatisticQueryDto,
  ): Promise<QuotesStatisticDto[]> {
    const start = query.startTime ? new Date(query.startTime) : undefined;
    const end = query.endTime ? new Date(query.endTime) : undefined;
    return this.service.getTimeline(start, end, query.timezone);
  }
}
