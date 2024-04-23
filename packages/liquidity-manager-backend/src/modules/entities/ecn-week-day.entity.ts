import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { EcnInstrument } from '../ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_week_days')
export class EcnWeekDay {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column('varchar', { length: 256, comment: 'string week day representation [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'description' })
  descr?: string;

  @OneToMany(() => EcnInstrument, ecnInstrument => ecnInstrument.swapRollover3Days)
  instruments: EcnInstrument[];
}
