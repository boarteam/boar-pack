import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ecn_state')
export class EcnState {
  @PrimaryGeneratedColumn({ type: 'tinyint', comment: 'object state ID [required]' })
  id: number;

  @Column('varchar', { length: 12, comment: 'string object state representation [required]' })
  name: string;
}
