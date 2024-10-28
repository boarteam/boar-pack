import { Column, Entity, JoinColumn, ManyToOne, Unique, } from 'typeorm';
import { EcnInstrument } from '../../ecn-instruments/entities/ecn-instrument.entity';
import { UsersSubAccountInst } from "../../users-sub-accounts-inst/entities/users-sub-account-inst.entity";
import { EcnCurrency } from "../../../entities/ecn-currency.entity";

@Entity('users_sublogin_instruments_settings')
@Unique('uk_usaii_i', ['usersSubAccountInst', 'instrument'])
export class SubloginSettings {
  @Column('int', { primary: true, name: 'users_sub_account_inst_id' })
  usersSubAccountInstId: string;

  @ManyToOne(() => UsersSubAccountInst, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'users_sub_account_inst_id',
  })
  usersSubAccountInst: UsersSubAccountInst;

  @Column('varchar', { length: 20, primary: true, name: 'instrument' })
  instrument: string;

  @ManyToOne(() => EcnInstrument, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'instrument',
    referencedColumnName: 'name',
  })
  instrumentRel: EcnInstrument;

  @Column('decimal', { precision: 18, scale: 8, default: 1.00000000 })
  hedgeMultiplier: string;

  @Column('int', { default: 0 })
  spreadLimit: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0.00000000 })
  minVolumeForABook: string;

  @Column('int', { default: 0 })
  spreadLimitOnRollover: number;

  @Column('int', { default: 0 })
  instrumentPriorityFlag: number;

  @Column('int', { default: 0 })
  markupBid: number;

  @Column('int', { default: 0 })
  markupAsk: number;

  @Column('varchar', { length: 20, default: '' })
  alias: string;

  @Column('int', { default: 0 })
  demi: number;

  @Column('int', { default: 0 })
  dema: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0.00000000 })
  hedgeAmount: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0.00000000 })
  hedgeStep: string;

  @ManyToOne(() => EcnCurrency)
  @JoinColumn({
    name: 'hedge_currency',
    referencedColumnName: 'name',
  })
  @Column('varchar', { length: 20, nullable: true, name: 'hedge_currency' })
  hedgeCurrency?: EcnCurrency | null;
}
