import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { EcnInstrument } from '../modules/ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_margin_calc_mode')
export class EcnMarginCalcMode {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column('varchar', { length: 256, comment: 'string profit calculation mode representation [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'description' })
  descr?: string;

  @OneToMany(() => EcnInstrument, ecnInstrument => ecnInstrument.marginMode)
  instruments: EcnInstrument[];
}
