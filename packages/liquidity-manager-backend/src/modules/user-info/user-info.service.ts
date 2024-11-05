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
    const { user } = await this.amtsDcService.getUserInfo({
      userId,
      serverId,
    });

    return this.formatUserInfo(user);
  }
}
