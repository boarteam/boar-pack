import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToMany } from 'typeorm';
import { DclAction } from '../../entities/dcl-action.entity';
import { UsersInstCompany } from '../../entities/users-inst-company.entity';
import { EcnCurrency } from '../../entities/ecn-currency.entity';
import { EcnWorkingMode } from '../../entities/ecn-working-modes.entity';
import { UsersInst } from '../../users-inst/entities/users-inst.entity';

@Entity('users_groups_inst')
export class UsersGroupsInst {
  @Column({ type: 'bigint', unsigned: true, default: '0', comment: 'unique user group id' })
  id: string;

  @PrimaryColumn('varchar', { length: 128, comment: 'User group name' })
  name: string;

  @ManyToOne(() => DclAction, action => action.id)
  @JoinColumn({ name: 'action' })
  @Column('tinyint', { default: 0, comment: 'Action for User(UNKNOWN, NEW, UPDATE, DELETE)' })
  action: DclAction;

  @Column('int', { unsigned: true, comment: 'user group leverage' })
  leverage: number;

  // @Column('bigint', { default: 0, unsigned: true, comment: 'user group currency id' })
  // currencyId: string;

  @ManyToOne<EcnCurrency>(() => EcnCurrency, (currency) => currency.usersGroups)
  @JoinColumn({ name: 'currency_name', referencedColumnName: 'name' })
  currency: EcnCurrency;

  @Column('varchar', { length: 96, comment: 'User group description' })
  descr: string;

  @Column('int', { default: 100, nullable: true, unsigned: true, comment: 'Margin call' })
  marginCall: number;

  @Column('int', { default: 60, nullable: true, unsigned: true, comment: 'Margin stopout' })
  marginStopout: number;

  @ManyToOne<UsersInstCompany>(() => UsersInstCompany, (company) => company.usersInst)
  @JoinColumn({ name: 'company_id' })
  company: UsersInstCompany;

  @ManyToOne<EcnWorkingMode>(() => EcnWorkingMode, (workingMode) => workingMode.usersGroups)
  @JoinColumn({ name: 'working_mode' })
  workingMode: EcnWorkingMode;

  @Column('int', { default: 1 })
  swapEnabled: number;

  @Column('int', { default: 0, unsigned: true, comment: 'UTC timestamp' })
  ts: number;

  @Column('int', { default: 0, comment: 'microsecs (from UTC timestamp)' })
  tsMs: number;

  @OneToMany<UsersInst>(() => UsersInst, (usersInst) => usersInst.group)
  usersInst: UsersInst;
}
