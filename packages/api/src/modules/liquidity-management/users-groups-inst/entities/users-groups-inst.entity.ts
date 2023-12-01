import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DclAction } from '../../entities/dcl-action.entity';
import { UsersInstCompany } from '../../entities/users-inst-company.entity';

@Entity('users_groups_inst')
export class UsersGroupsInst {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'unique user group id' })
  id: string;

  @Column('varchar', { length: 256, comment: 'User group name' })
  name: string;

  @ManyToOne(() => DclAction, action => action.id)
  @JoinColumn({ name: 'action' })
  @Column('tinyint', { default: 0, comment: 'Action for User(UNKNOWN, NEW, UPDATE, DELETE)' })
  action: DclAction;

  @Column('int', { unsigned: true, comment: 'user group leverage' })
  leverage: number;

  @Column('bigint', { default: 0, unsigned: true, comment: 'user group currency id' })
  currencyId: string;

  @Column('varchar', { length: 16, comment: 'user group currency name' })
  currencyName: string;

  @Column('varchar', { length: 96, comment: 'User group description' })
  descr: string;

  @Column('int', { default: 100, nullable: true, unsigned: true, comment: 'Margin call' })
  marginCall: number;

  @Column('int', { default: 60, nullable: true, unsigned: true, comment: 'Margin stopout' })
  marginStopout: number;

  @Column('int', { default: 0 })
  companyId: number;

  @ManyToOne<UsersInstCompany>(() => UsersInstCompany, (company) => company.usersInst)
  @JoinColumn({ name: 'company_id' })
  company: UsersInstCompany;

  @Column('int', { default: 0 })
  type: number;

  @Column('int', { default: 1 })
  swapMode: number;

  @Column('int', { default: 0, unsigned: true, comment: 'UTC timestamp' })
  ts: number;

  @Column('int', { default: 0, comment: 'microsecs (from UTC timestamp)' })
  tsMs: number;

}
