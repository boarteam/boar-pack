import { Injectable } from '@nestjs/common';
import { PositionDto, PositionSide } from "./dto/positions.dto";
import { AmtsDcService } from "../amts-dc/amts-dc.service";

@Injectable()
export class PositionsService {
  constructor(
    private readonly amtsDcService: AmtsDcService,
  ) {
  }

  async getPositions(userId: number): Promise<PositionDto[]> {
    const response = await this.amtsDcService.getPositions(userId);
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
