import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ecn_password_hast_type')
export class EcnPasswordHashType {
  @PrimaryGeneratedColumn({ type: 'int', comment: 'password hash type ID [required]' })
  id: number;

  @Column('varchar', { length: 24, comment: 'password hash type name [required]' })
  name: string;
}
