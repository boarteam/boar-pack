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
    const leverage = Number(userInfo.leverage);
    const balance = Number(userInfo.balance);
    const profit = Number(userInfo.profit);
    const margin = Number(userInfo.margin);
    const equity = balance + profit;

    return {
      id: Number(userInfo.id),
      name: userInfo.name,
      groupName: userInfo.group_name,
      leverage: String(userInfo.leverage),
      currency: userInfo.currency,
      balance: userInfo.balance,
      margin: userInfo.margin,
      profit: userInfo.profit,
      equity: String(equity),
      freeMargin: String(balance + profit - margin),
      marginLevel: margin === 0 ? '-' : String(equity / margin * leverage),
    }
  }

  public async getUserInfo(userId: number): Promise<UserInfoDto> {
    const serverId = await this.usersInstService.getMarginModuleId(userId);
    const response = await this.amtsDcService.getUserInfo({
      userId,
      serverId,
    });

    return this.formatUserInfo(response.result);
  }
}
