import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { EcnInstrument } from '../modules/ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_swap_types')
export class EcnSwapType {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @OneToMany<EcnInstrument>(() => EcnInstrument, ecnInstrument => ecnInstrument.swapType)
  instruments: EcnInstrument[];

  @Column('varchar', { length: 256, comment: 'string swap type representation [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'description' })
  descr?: string;
}
