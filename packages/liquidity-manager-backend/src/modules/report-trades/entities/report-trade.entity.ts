import { ViewEntity, ViewColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { DclOrderSide } from "../../../entities/dcl-order-side.entity";
import { DclOrderType } from "../../../entities/dcl-order-type.entity";
import { DclOrderBookType } from "../../../entities/dcl-order-book-type.entity";
import { DclOrderState } from "../../../entities/dcl-order-state.entity";

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
  @PrimaryColumn()
  clientOrderId: string;

  @ViewColumn({ name: 'status' })
  statusId: number;

  @ManyToOne(() => DclOrderState)
  @JoinColumn({
    name: 'status',
    referencedColumnName: 'id'
  })
  status: DclOrderState;

  @ViewColumn({ name: 'book_type' })
  bookTypeId: number;

  @ManyToOne(() => DclOrderBookType)
  @JoinColumn({
    name: 'book_type',
    referencedColumnName: 'id'
  })
  bookType: DclOrderBookType;

  @ViewColumn({ name: 'order_type' })
  orderTypeId: number;

  @ManyToOne(() => DclOrderType)
  @JoinColumn({
    name: 'order_type',
    referencedColumnName: 'id'
  })
  orderType: DclOrderType;

  @ViewColumn({ name: 'side' })
  sideId: number;

  @ManyToOne(() => DclOrderSide)
  @JoinColumn({
    name: 'side',
    referencedColumnName: 'id'
  })
  side: DclOrderSide;

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
