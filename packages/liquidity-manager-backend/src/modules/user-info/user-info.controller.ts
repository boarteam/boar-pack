import { Controller, ForbiddenException, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { UserInfoService } from './user-info.service';
import { ViewUserInfoPolicy } from "./policies/view-user-info.policy";
import { UserInfoDto } from "./dto/user-info.dto";
import { Request } from 'express';

@CheckPolicies(new ViewUserInfoPolicy())
@ApiTags('UserInfo')
@Controller('liquidity/user-info')
export class UserInfoController {
  constructor(
    readonly service: UserInfoService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: UserInfoDto,
  })
  getUserInfo(
    @Req() req: Request,
  ): Promise<UserInfoDto> {
    const userId = req.user?.id;
    if (userId === undefined) {
      throw new ForbiddenException('User is not authenticated');
    }

    return this.service.getUserInfo(Number(req.user?.id));
  }
}
