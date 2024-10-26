import { Injectable } from '@nestjs/common';
import { UserInfoDto } from "./dto/user-info.dto";
import { AmtsDcService } from "../amts-dc/amts-dc.service";
import { UsersInstService } from "../users-inst/users-inst.service";
import { MTUserInfo } from "../amts-dc/dto/amts-dc.dto";

@Injectable()
export class UserInfoService {
  constructor(
    private readonly amtsDcService: AmtsDcService,
    private readonly usersInstService: UsersInstService,
  ) {
  }

  public formatUserInfo(userInfo: MTUserInfo): UserInfoDto {
    return {
      id: Number(userInfo.id),
      name: userInfo.name,
      groupName: userInfo.group_name,
      leverage: Number(userInfo.leverage),
      accountState: {
        balance: userInfo.account_state.balance,
        margin: userInfo.account_state.margin,
        profit: userInfo.account_state.profit,
      }
    }
  }

  public async getUserInfo(userId: number): Promise<UserInfoDto> {
    const serverId = await this.usersInstService.getMarginModuleId(userId);
    const { user } = await this.amtsDcService.getUserInfo({
      userId,
      serverId,
    });

    return this.formatUserInfo(user);
  }
}
