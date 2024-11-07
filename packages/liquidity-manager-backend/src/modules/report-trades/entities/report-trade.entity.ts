import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity('view_report_trades')
export class ReportTrade {
  @ViewColumn({ name: 'ts' })
  timestamp: number;

  @ViewColumn({ name: 'ts_ms' })
  timestampMs: number;

  @ViewColumn({ name: 'userId' })
  userId: number;

  @ViewColumn({ name: 'sub_account' })
  subAccount: number;

  @ViewColumn({ name: 'client_order_id' })
  clientOrderId: string;

  @ViewColumn({ name: 'status' })
  status: number;

  @ViewColumn({ name: 'book_type' })
  bookType: number;

  @ViewColumn({ name: 'order_type' })
  orderType: number;

  @ViewColumn({ name: 'side' })
  side: number;

  @ViewColumn({ name: 'instrument' })
  instrument: string;

  @ViewColumn({ name: 'amount' })
  amount: number;

  @ViewColumn({ name: 'price' })
  price: number;

  @ViewColumn({ name: 'client_price' })
  clientPrice: number;

  @ViewColumn({ name: 'commission_liquidity' })
  commissionLiquidity: number;

  @ViewColumn({ name: 'commission_turnover' })
  commissionTurnover: number;

  @ViewColumn({ name: 'profit' })
  profit: number;

  @ViewColumn({ name: 'LP' })
  lp: string;

  @ViewColumn({ name: 'uniq_oid_file_time' })
  uniqueOidFileTime: number;
}
