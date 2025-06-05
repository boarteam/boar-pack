import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InstrumentsHistoryService } from "./instruments-history.service";
import { CheckPolicies } from "@boarteam/boar-pack-users-backend";
import { ViewInstrumentsHistory } from "./policies/view-instruments-history";
import { InstrumentsHistoryQueryDto } from "./dto/instruments-history-query.dto";
import { InstrumentsHistoryResponseDto } from "./dto/instruments-history-response.dto";

@ApiTags('InstrumentsHistory')
@ApiExtraModels(InstrumentsHistoryResponseDto, InstrumentsHistoryQueryDto)
@CheckPolicies(new ViewInstrumentsHistory())
@Controller('instruments-history')
export class InstrumentsHistoryController {
  constructor(
    readonly service: InstrumentsHistoryService,
  ) {}

  @Get('availability-report')
  @ApiOkResponse({
    type: InstrumentsHistoryResponseDto,
  })
  async getAvailabilityReport(
    @Query() query: InstrumentsHistoryQueryDto,
  ): Promise<InstrumentsHistoryResponseDto> {
    return this.service.getAvailabilityReport(query);
  }
}
