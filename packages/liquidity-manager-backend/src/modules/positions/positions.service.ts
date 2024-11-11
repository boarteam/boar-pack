import { Injectable } from '@nestjs/common';
import { PositionDto, PositionSide } from "./dto/positions.dto";
import { AmtsDcService } from "../amts-dc/amts-dc.service";
import { UsersInstService } from "../users-inst/users-inst.service";

const priorityOrder = ['[', '@', '#'];
const getPriority = (instrument: string) => {
  const firstChar = instrument[0];
  const index = priorityOrder.indexOf(firstChar);
  return index === -1 ? priorityOrder.length : index;
};

@Injectable()
export class PositionsService {
  constructor(
    private readonly amtsDcService: AmtsDcService,
    private readonly usersInstService: UsersInstService,
  ) {
  }

  async getPositions(userId: number): Promise<PositionDto[]> {
    const serverId = await this.usersInstService.getMarginModuleId(userId);
    const response = await this.amtsDcService.getPositions({
      userId,
      serverId,
    });

    return response.result
    .map((position) => ({
      id: position.id,
      userId: position.user_id,
      instrument: position.instrument,
      side: position.side as PositionSide,
      amount: position.amount,
      openPrice: position.open_price,
      price: position.price,
      margin: position.margin,
      profit: position.profit,
      createdAt: new Date(position.ts_create),
      updatedAt: new Date(position.ts_update),
    }))
    .sort((a, b) => {
      const priorityComparison = getPriority(a.instrument) - getPriority(b.instrument);
      if (priorityComparison === 0) {
        return a.instrument.localeCompare(b.instrument);
      }

      return priorityComparison;
    });
  }
}
