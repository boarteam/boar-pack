import { Injectable } from '@nestjs/common';
import { UserInfoDto } from "./dto/user-info.dto";
import { TpDcService } from "../tp-dc/tp-dc.service";
import { UsersInstService } from "../users-inst/users-inst.service";

@Injectable()
export class UserInfoService {
  constructor(
    private readonly tpDcService: TpDcService,
    private readonly usersInstService: UsersInstService,
  ) {
  }

  async getUserInfo(userId: number): Promise<UserInfoDto> {
    const serverId = await this.usersInstService.getMarginModuleId(userId);
    const { user } = await this.tpDcService.getUserInfo({
      userId,
      serverId,
    });

    return {
      id: Number(user.id),
      name: user.name,
      groupName: user.group_name,
      leverage: Number(user.leverage),
      accountState: {
        balance: user.account_state.balance,
        margin: user.account_state.margin,
        profit: user.account_state.profit,
      }
    }
  }
}
