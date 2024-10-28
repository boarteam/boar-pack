import { ViewEntity, PrimaryColumn, ViewColumn } from 'typeorm';

@ViewEntity('view_instruments_specifications')
export class ViewInstrumentsSpecification {
  @PrimaryColumn()
  @ViewColumn()
  instrument: string;

  @ViewColumn()
  instrumentDescr?: string;

  @ViewColumn()
  groupName: string;

  @ViewColumn()
  priceDigits: number;

  @ViewColumn()
  marginCurrency: string;

  @ViewColumn()
  currency: string;

  @ViewColumn()
  commission: string;

  @ViewColumn()
  marginPercenage: string;

  @ViewColumn()
  minPositionSize: string;

  @ViewColumn()
  maxPositionSize: string;

  @ViewColumn()
  tickSize: string;

  @ViewColumn()
  tickValue: string;

  @ViewColumn()
  swapType: string;

  @ViewColumn({ name: 'swap_rollover3days' })
  swapRollover3Days: string;

  @ViewColumn()
  swapLong: string;

  @ViewColumn()
  swapShort: string;
}
