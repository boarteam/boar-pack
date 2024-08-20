import { Injectable, NotFoundException } from '@nestjs/common';
import { PositionDto, PositionSide } from "./dto/positions.dto";
import { TpDcService } from "../tp-dc/tp-dc.service";
import { UsersInstService } from "../users-inst/users-inst.service";

@Injectable()
export class PositionsService {
  constructor(
    private readonly tpDcService: TpDcService,
    private readonly usersInstService: UsersInstService,
  ) {
  }

  async getPositions(userId: number): Promise<PositionDto[]> {
    const user = await this.usersInstService.findOne({
      where: {
        id: String(userId),
      },
    })

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const response = await this.tpDcService.getPositions({
      userId,
      serverId: user.marginModuleId,
    });
    return response.positions.map(position => ({
      id: position.id,
      userId: position.user_id,
      instrument: position.instrument,
      side: position.side as PositionSide,
      amount: position.amount,
      openPrice: position.open_price,
      margin: position.margin,
      profit: position.profit,
      createdAt: new Date(position.ts_create),
      updatedAt: new Date(position.ts_update),
    }));
  }
}
