import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { EcnInstrument } from '../ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_profit_calc_mode')
export class EcnProfitCalcMode {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column('varchar', { length: 256, comment: 'string profit calculation mode representation [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'description' })
  descr?: string;

  @OneToMany(() => EcnInstrument, ecnInstrument => ecnInstrument.profitMode)
  instruments: EcnInstrument[];
}
