import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EcnInstrument } from '../../ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_instruments_groups')
export class EcnInstrumentsGroup {
  @PrimaryGeneratedColumn({ type: 'int', comment: 'Unique Id' })
  id: number;

  @Column('varchar', { length: 24, default: '', comment: 'Instrument group name' })
  name: string;

  @Column('varchar', { length: 64, nullable: true, comment: 'Instrument group description' })
  descr?: string;

  @OneToMany(() => EcnInstrument, ecnInstrument => ecnInstrument.instrumentGroup)
  instruments: EcnInstrument[];
}
