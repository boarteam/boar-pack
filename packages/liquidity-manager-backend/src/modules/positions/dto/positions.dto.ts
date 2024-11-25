export enum PositionSide {
  BUY = 'buy',
  SELL = 'sell',
}

export class PositionDto {
  userId: number | string;
  id: number | string;
  instrument: string;
  side: PositionSide;
  amount: number | string;
  openPrice: number | string;
  margin: number | string;
  profit: number | string;
  createdAt: Date;
  updatedAt: Date;
}
