import { ViewColumn, ViewEntity, } from 'typeorm';

@ViewEntity('view_report_account_summary')
export class ReportAccountStatement {
  @ViewColumn({ name: 'timestamp' })
  timestamp: Date;

  @ViewColumn({ name: 'userid' })
  accountNumber: string;

  @ViewColumn({ name: 'account_name' })
  accountName: string;

  @ViewColumn({ name: 'user_comment' })
  userComment: string;

  @ViewColumn({ name: 'account_name_comment' })
  accountNameComment: string;

  @ViewColumn({ name: 'currency_name' })
  currencyName: string;

  @ViewColumn({ name: 'opening_balance' })
  openingBalance: number;

  @ViewColumn({ name: 'opening_profit_loss' })
  openingProfitLoss: number;

  @ViewColumn({ name: 'deposit' })
  deposit: number;

  @ViewColumn({ name: 'withdrawal' })
  withdrawal: number;

  @ViewColumn({ name: 'realized_profit_loss' })
  realizedProfitLoss: number;

  @ViewColumn({ name: 'dividends' })
  dividends: number;

  @ViewColumn({ name: 'swaps' })
  swaps: number;

  @ViewColumn({ name: 'closing_balance' })
  closingBalance: number;

  @ViewColumn({ name: 'closing_profit_loss' })
  closingProfitLoss: number;

  @ViewColumn({ name: 'closing_equity' })
  closingEquity: number;

  @ViewColumn({ name: 'margin_on_open_positions' })
  marginOnOpenPositions: number;

  @ViewColumn({ name: 'available_to_trade' })
  availableToTrade: number;

  @ViewColumn({ name: 'turnover_in_USD' })
  turnoverInUsd: number;

  @ViewColumn({ name: 'turnover_in_USD_A' })
  turnoverInUsdA: number;

  @ViewColumn({ name: 'turnover_in_USD_B' })
  turnoverInUsdB: number;

  @ViewColumn({ name: 'commission_turnover' })
  commissionTurnover: number;

  @ViewColumn({ name: 'commission_liquidity' })
  commissionLiquidity: number;

  @ViewColumn({ name: 'corrections' })
  corrections: number;
}
