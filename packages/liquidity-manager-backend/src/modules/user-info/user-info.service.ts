import { Injectable } from '@nestjs/common';
import { UserInfoDto } from "./dto/user-info.dto";
import { TpDcService } from "../tp-dc/tp-dc.service";
import { UsersInstService } from "../users-inst/users-inst.service";
import { MTUserInfo } from "../tp-dc/dto/tp-dc.dto";

@Injectable()
export class UserInfoService {
  constructor(
    private readonly tpDcService: TpDcService,
    private readonly usersInstService: UsersInstService,
  ) {
  }

  public formatUserInfo(userInfo: MTUserInfo): UserInfoDto {
    const {
      balance,
      profit,
      margin,
    } = userInfo.account_state;

    const leverage = Number(userInfo.leverage);
    const equity = balance + profit;

    return {
      id: Number(userInfo.id),
      name: userInfo.name,
      groupName: userInfo.group_name,
      leverage,
      currency: userInfo.currency,
      accountState: {
        balance,
        margin,
        profit,
        equity,
        freeMargin: balance + profit - margin,
        marginLevel: equity / margin * leverage,
      }
    }
  }

  public async getUserInfo(userId: number): Promise<UserInfoDto> {
    const serverId = await this.usersInstService.getMarginModuleId(userId);
    const { user } = await this.tpDcService.getUserInfo({
      userId,
      serverId,
    });

    return this.formatUserInfo(user);
  }
}
