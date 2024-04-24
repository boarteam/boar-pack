import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { EcnInstrument } from '../ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_commission_lots_mode')
export class EcnCommissionLotsMode {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column('varchar', { length: 256, comment: 'string commission lots mode representation [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'description' })
  descr?: string;

  @OneToMany(() => EcnInstrument, ecnInstrument => ecnInstrument.commissionLotsMode)
  instruments: EcnInstrument[];
}