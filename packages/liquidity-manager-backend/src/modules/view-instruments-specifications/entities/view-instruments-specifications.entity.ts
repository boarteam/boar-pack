import { ViewEntity, PrimaryColumn, ViewColumn } from 'typeorm';

@ViewEntity('view_instruments_specifications')
export class ViewInstrumentsSpecification {
  @ViewColumn({ name: 'from_moduleid' })
  fromModuleId: number;

  @ViewColumn()
  @PrimaryColumn()
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

  @ViewColumn()
  tripleSwapDay: string;

  @ViewColumn()
  swapLong: string;

  @ViewColumn()
  swapShort: string;
}
