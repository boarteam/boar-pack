export enum PositionSide {
  BUY = 'buy',
  SELL = 'sell',
}

export class PositionDto {
  userId: number;
  id: number;
  instrument: string;
  side: PositionSide;
  amount: number;
  openPrice: number;
  margin: number;
  profit: number;
  createdAt: Date;
  updatedAt: Date;
}
