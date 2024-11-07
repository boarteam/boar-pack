import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity('view_report_balance_operations')
export class ReportBalanceOperation {
  @ViewColumn({ name: 'id' })
  @PrimaryColumn()
  id: number;

  @ViewColumn({ name: 'timestamp' })
  timestamp: Date;

  @ViewColumn({ name: 'userId' })
  userId: string;

  @ViewColumn({ name: 'balance' })
  balance: number;

  @ViewColumn({ name: 'margin' })
  margin: number;

  @ViewColumn({ name: 'profitLoss' })
  profitLoss: number;

  @ViewColumn({ name: 'trans_type' })
  transType: string;

  @ViewColumn({ name: 'trans_value' })
  transValue: number;

  @ViewColumn({ name: 'trans_comment' })
  transComment: string;
}
