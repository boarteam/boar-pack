import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ReportAccountStatement } from './entities/report-account-statement.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Injectable()
export class ReportAccountStatementsService extends TypeOrmCrudService<ReportAccountStatement> {

  constructor(
    @InjectRepository(ReportAccountStatement, AMTS_DB_NAME)
    readonly repo: Repository<ReportAccountStatement>,

    @InjectDataSource(AMTS_DB_NAME)
    private readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async getReport({
    userId,
    startTime,
    endTime,
  }: {
    userId: number,
    startTime: string,
    endTime: string,
  }): Promise<ReportAccountStatement | null> {
    // language=MySQL
    const results = await this.dataSource.query<ReportAccountStatement[]>(`
      select
          us.userid as accountNumber,
          us.account_name as accountName,
          us.account_name_comment as accountNameComment,
          us.currency_name as currencyName,
          us_first.opening_balance as openingBalance,
          us_first.opening_profit_loss as openingProfitLoss,
          
          sum(us.deposit) as deposit,
          sum(us.withdrawal) as withdrawal,
          sum(us.realized_profit_loss) as realizedProfitLoss,
          sum(us.dividends) as dividends,
          sum(us.swaps) as swaps,
          
          us_last.closing_balance as closingBalance,
          us_last.closing_profit_loss as closingProfitLoss,
          us_last.closing_equity as closingEquity,
          us_last.margin_on_open_positions as marginOnOpenPositions,
          us_last.available_to_trade as availableToTrade,
          
          sum(us.turnover_in_usd) as turnoverInUsd,
          sum(us.turnover_in_usd_a) as turnoverInUsdA,
          sum(us.turnover_in_usd_b) as turnoverInUsdB,
          sum(us.commission_turnover) as commissionTurnover,
          sum(us.commission_liquidity) as commissionLiquidity,
          sum(us.corrections) as corrections

      from view_report_account_summary us

          -- last record
          inner join
            (select
                 userid,
                 closing_balance,
                 closing_profit_loss,
                 closing_equity,
                 margin_on_open_positions,
                 available_to_trade
             from view_report_account_summary
             where
                 userid = ?
                 and (timestamp >= ? and timestamp < ?)
             order by timestamp desc
             limit 1) as us_last
          on us.userid = us_last.userid

          -- first record
          inner join
            (select
                 userid,
                 opening_balance,
                 opening_profit_loss
             from view_report_account_summary
             where
                 userid = ?
                 and (timestamp >= ? and timestamp < ?)
             order by timestamp asc
             limit 1) as us_first
          on us.userid = us_first.userid

      where
          us.userid = ?
          and (us.timestamp >= ? and us.timestamp < ?)

      group by us.userid,
          us_first.opening_balance,
          us_first.opening_profit_loss,
          us_last.closing_balance,
          us_last.closing_profit_loss,
          us_last.closing_equity,
          us_last.margin_on_open_positions,
          us_last.available_to_trade
      ;
    `, [
      userId,
      startTime,
      endTime,
      userId,
      startTime,
      endTime,
      userId,
      startTime,
      endTime,
    ]);

    return results[0] ?? null;
  }
}
