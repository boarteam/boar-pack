import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { PositionsService } from './positions.service';
import { ViewPositionsPolicy } from "./policies/view-positions.policy";
import { PositionsQueryDto } from "./dto/positions-query.dto";
import { PositionDto } from "./dto/positions.dto";

@CheckPolicies(new ViewPositionsPolicy())
@ApiTags('Positions')
@Controller('liquidity/positions')
export class PositionsController {
  constructor(
    readonly service: PositionsService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: PositionDto,
    isArray: true,
  })
  getPositions(
    @Query() query: PositionsQueryDto,
  ): Promise<PositionDto[]> {
    return this.service.getPositions(Number(query.userId));
  }
}
