import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from '@boarteam/boar-pack-users-backend';
import { UsersConnectionsStatisticDto } from "./dto/users-connections-statistic.dto";
import { UsersConnectionsStatisticQueryDto } from "./dto/users-connections-statistic-query.dto";
import { UsersConnectionsStatisticService } from "./users-connections-statistic.service";
import { ViewUsersConnectionsStatistic } from "./policies/view-users-connections-statistic";

@CheckPolicies(new ViewUsersConnectionsStatistic())
@ApiTags('UsersConnectionsStatistic')
@ApiExtraModels(UsersConnectionsStatisticDto, UsersConnectionsStatisticQueryDto)
@Controller('users-connections-statistic')
export class UsersConnectionsStatisticController {
  constructor(
    readonly service: UsersConnectionsStatisticService,
  ) {}

  @Get('timeline')
  @ApiOkResponse({
    type: UsersConnectionsStatisticDto,
    isArray: true,
  })
  async getTimeline(
    @Query() query: UsersConnectionsStatisticQueryDto,
  ): Promise<UsersConnectionsStatisticDto[]> {
    const start = query.startTime ? new Date(query.startTime) : undefined;
    const end = query.endTime ? new Date(query.endTime) : undefined;
    return this.service.getTimeline(start, end, query.timezone);
  }
}
