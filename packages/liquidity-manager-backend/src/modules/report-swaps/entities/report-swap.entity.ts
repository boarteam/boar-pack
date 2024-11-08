import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity('view_report_swaps')
export class ReportSwap {
  @ViewColumn({ name: 'timestamp' })
  timestamp: number;

  @ViewColumn({ name: 'userId' })
  userId: number;

  @ViewColumn({ name: 'instrument' })
  instrument: string;

  @ViewColumn({ name: 'amount' })
  amount: number;

  @ViewColumn({ name: 'swap' })
  swap: number;
}
