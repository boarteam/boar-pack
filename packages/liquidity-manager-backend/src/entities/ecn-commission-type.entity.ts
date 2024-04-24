import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { EcnInstrument } from '../modules/ecn-instruments/entities/ecn-instrument.entity';

@Entity('ecn_commission_types')
export class EcnCommissionType {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column('varchar', { length: 256, comment: 'string commission type representation [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'description' })
  descr?: string;

  @OneToMany(() => EcnInstrument, ecnInstrument => ecnInstrument.commissionType)
  instruments: EcnInstrument[];
}
