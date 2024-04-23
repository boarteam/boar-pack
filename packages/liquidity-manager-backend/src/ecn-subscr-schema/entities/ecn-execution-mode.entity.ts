import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ecn_execution_mode')
export class EcnExecutionMode {
  @PrimaryGeneratedColumn({ type: 'tinyint', comment: 'Unique execution mode ID [required]' })
  id: number;

  @Column('varchar', { length: 256, comment: 'Execution mode name [required]' })
  name: string;

  @Column('varchar', { length: 512, nullable: true, comment: 'Description' })
  descr?: string;
}
