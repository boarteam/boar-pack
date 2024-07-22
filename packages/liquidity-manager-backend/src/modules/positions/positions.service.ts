import { Injectable } from '@nestjs/common';
import { PositionDto, PositionSide } from "./dto/positions.dto";
import { TpDcService } from "../tp-dc/tp-dc.service";

@Injectable()
export class PositionsService {
  constructor(
    private readonly tpDcService: TpDcService,
  ) {
  }

  async getPositions(userId: number): Promise<PositionDto[]> {
    const auth = await this.tpDcService.auth({
      login: 123,
    });
    const response = await this.tpDcService.getPositions(auth, userId);
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
