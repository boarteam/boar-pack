import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { EcnInstrumentsGroup } from '../../ecn-instruments-groups/entities/ecn-instruments-group.entity';
import { EcnMarginCalcMode } from '../../entities/ecn-margin-calc-mode.entity';
import { EcnProfitCalcMode } from '../../entities/ecn-profit-calc-mode.entity';
import { EcnSwapType } from '../../entities/ecn-swap-type.entity';
import { EcnCommissionLotsMode } from '../../entities/ecn-commission-lots-mode.entity';
import { EcnCommissionType } from '../../entities/ecn-commission-type.entity';
import { EcnWeekDay } from '../../entities/ecn-week-day.entity';

@Entity('ecn_instruments')
@Unique('idx_ecn_instruments_name', ['name'])
export class EcnInstrument {
  @PrimaryColumn({ type: 'bigint', unsigned: true, comment: 'Symbol id (hash)' })
  instrumentHash: string;

  @Column('varchar', { length: 20, comment: 'Symbol name' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'Description' })
  descr?: string;

  @Column('int', { unsigned: true, default: 5, comment: 'Symbol price decimal digits' })
  priceDigits: number;

  @Column('decimal', { precision: 18, scale: 6, default: 0, comment: 'Symbol price liquidity limit' })
  priceLiquidityLimit: string;

  @Column('int', { default: 0, comment: 'Max quote deviation' })
  maxQuoteDeviation: number;

  @Column('int', { default: 0, comment: 'Max quote time deviation' })
  maxQuoteTimeDeviation: number;

  @Column('decimal', { precision: 18, scale: 2, comment: 'Contract size' })
  contractSize: string;

  @Column('tinyint', { default: 0, comment: 'Enable swaps' })
  swapEnable: number;

  @ManyToOne(() => EcnSwapType, swapType => swapType.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'swap_type' })
  @Column('tinyint', { comment: 'Swap type (from ecn_swap_types)' })
  swapType: EcnSwapType;

  @ManyToOne(() => EcnWeekDay, weekDay => weekDay.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'swap_rollover3days' })
  @Column('tinyint', {
    name: 'swap_rollover3days',
    default: 3,
    comment: 'triple rollover day-0-Monday,1-Tuesday...4-Friday'
  })
  swapRollover3Days: EcnWeekDay;

  @Column('decimal', { precision: 18, scale: 8, default: 0, comment: 'Swaps values for long positions' })
  swapLong: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0, comment: 'Swaps values for short positions' })
  swapShort: string;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'One tick value (tick price)' })
  tickPrice: string;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'One tick size' })
  tickSize: string;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'Commission value' })
  commission: string;

  @ManyToOne(() => EcnCommissionType, commissionType => commissionType.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'commission_type' })
  @Column('tinyint', { comment: 'Commission type (from ecn_commission_types)' })
  commissionType: EcnCommissionType;

  @ManyToOne(() => EcnCommissionLotsMode, commissionLotsMode => commissionLotsMode.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'commission_lots_mode' })
  @Column('tinyint', { comment: 'Commission lots mode (from ecn_commission_lots_mode)' })
  commissionLotsMode: EcnCommissionLotsMode;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'Agent commission value' })
  commissionAgent: string;

  @ManyToOne(() => EcnCommissionType, commissionAgentType => commissionAgentType.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'commission_agent_type' })
  @Column('tinyint', { comment: 'Agent commission type (from ecn_commission_types)' })
  commissionAgentType: EcnCommissionType;

  @ManyToOne(() => EcnCommissionLotsMode, commissionAgentLotsMode => commissionAgentLotsMode.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'commission_agent_lots_mode' })
  @Column('tinyint', { comment: 'Agent commission lots mode (from ecn_commission_lots_mode)' })
  commissionAgentLotsMode: EcnCommissionLotsMode;

  @ManyToOne(() => EcnProfitCalcMode, profitCalcMode => profitCalcMode.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'profit_mode' })
  @Column('tinyint', { comment: 'Profit calculation mode (from ecn_profit_calc_mode)' })
  profitMode: EcnProfitCalcMode;

  @ManyToOne(() => EcnMarginCalcMode, marginCalcMode => marginCalcMode.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'margin_mode' })
  @Column('tinyint', { comment: 'Margin calculation mode (from ecn_margin_calc_mode)' })
  marginMode: EcnMarginCalcMode;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'Initial margin' })
  marginInitial: string;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'Margin maintenance' })
  marginMaintenance: string;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'Hedged margin' })
  marginHedged: string;

  @Column('decimal', { precision: 12, scale: 6, default: 0, comment: 'Margin divider' })
  marginDivider: string;

  @Column('varchar', { length: 20, comment: 'Margin currency (for margin calculation)' })
  marginCurrency: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0, comment: 'Swap limit value by each instrument' })
  swapLimit: string;

  @Column('decimal', { precision: 18, scale: 6, default: 0, comment: 'Reserved liquidity limit field for TradeServer' })
  tsPriceLiquidityLimit: string;

  @Column('varchar', { length: 20, comment: 'Calculation currency of the instrument' })
  currency: string;

  @ManyToOne(() => EcnInstrumentsGroup, instrumentsGroup => instrumentsGroup.instruments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'instrument_group' })
  @Column('int', { default: 1, comment: 'Instrument group identifier' })
  instrumentGroup: EcnInstrumentsGroup;

  @Column('datetime', { default: () => "'1970-01-01 00:00:00'", comment: 'Start expiration datetime' })
  startExpirationDatetime: Date;

  @Column('datetime', { default: () => "'1970-01-01 00:00:00'", comment: 'Expiration datetime' })
  expirationDatetime: Date;

  @Column('varchar', { length: 20, default: '', comment: 'Basis' })
  basis: string;

  @Column('tinyint', { width: 1, default: 0, comment: 'Delete band on abook nos' })
  delBandOnAbookNos: number;

  @Column('tinyint', { width: 1, default: 0, comment: 'Delete band on bbook nos' })
  delBandOnBbookNos: number;
}
