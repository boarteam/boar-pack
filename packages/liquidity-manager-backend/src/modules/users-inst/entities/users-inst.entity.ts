import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { EcnModule } from '../../ecn-modules/entities/ecn-module.entity';
import { UsersInstCompany } from '../../../entities/users-inst-company.entity';
import { UsersGroupsInst } from "../../users-groups-inst/entities/users-groups-inst.entity";
import { DclAction } from "../../../entities/dcl-action.entity";
import { EcnCommissionType } from '../../../entities/ecn-commission-type.entity';
import { EcnCommissionLotsMode } from "../../../entities/ecn-commission-lots-mode.entity";

@Entity('users_inst')
export class UsersInst {
  @Column('int', { unsigned: true, comment: 'UTC timestamp' })
  ts: number;

  @Column('int', { default: 0, comment: 'microsecs (from UTC timestamp)' })
  tsMs: number;

  // warning: i can't set default '0' here
  // id bigint unsigned default '0' not null comment 'unique user id'
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'unique user id' })
  id: string;

  @Column('varchar', { length: 256, comment: 'User name' })
  name: string;

  @ManyToOne<UsersGroupsInst>(() => UsersGroupsInst, (group) => group.usersInst)
  @JoinColumn({ name: 'groupname', referencedColumnName: 'name' })
  @Column('varchar', { length: 128, comment: 'User name', name: 'groupname' })
  group: UsersGroupsInst;

  @ManyToOne(() => DclAction, action => action.id)
  @JoinColumn({ name: 'action' })
  @Column('tinyint', { default: 0, comment: 'Action for User(UNKNOWN, NEW, UPDATE, DELETE)' })
  action: DclAction;

  @Column('int', { unsigned: true, comment: 'user leverage' })
  leverage: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user balance' })
  balance: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user credit' })
  credit: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user margin' })
  margin: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user free margin' })
  freeMargin: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user margin level' })
  marginLevel: string;

  @Column('varchar', { length: 256, default: '', comment: 'User comment' })
  userComment: string;

  @Column('tinyint', { default: 0, comment: 'enabled/disabled switcher' })
  enabled: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user profitLoss' })
  profitloss: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user margin with limits' })
  marginWithLimits: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0, comment: 'user commission' })
  commission: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0, comment: 'user swap' })
  swap: string;

  @Column('bigint', { unsigned: true, default: 0, comment: 'user stopout hash' })
  stopoutHash: string;

  @Column('varchar', { length: 128, comment: 'user stopout name' })
  stopoutName: string;

  // Skipped in UI and dtos: user_state - пока скипить. это тоже что-то старое. - Yuriy Kovalenko
  @Column('tinyint', { default: -1, comment: 'state for User( ENABLED, DISABLED_BY_BAD_FILL, DISABLED_BY_BAD_AMOUNT, DISABLED_BY_BAD_STOPOUT)' })
  userState: number;

  @Column('tinyint', { width: 1, default: 1, comment: 'Enabled/disabled stopout' })
  stopoutEnabled: number;

  @Column('bigint', { default: 0, comment: 'stopout suppress time (with msec)' })
  stopoutSuppressTime: string;

  @Column('bigint', { default: 0, comment: 'stopout generation time (with msec)' })
  stopoutGenerationTime: string;

  @ManyToOne<EcnModule>(() => EcnModule, {
    onUpdate: 'CASCADE' ,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  @Column('int', { default: 0, comment: 'mt bridge module id', name: 'module_id' })
  module: EcnModule;

  @Column('varchar', { length: 64, default: '', comment: 'user password (md5 hash)' })
  password: string;

  @Column('decimal', { precision: 18, scale: 6, default: 0, comment: 'commission value' })
  commissionValue: string;

  @ManyToOne<EcnCommissionType>(() => EcnCommissionType, type => type.id)
  @JoinColumn({ name: 'commission_type' })
  @Column('tinyint', { default: 1, comment: 'commission type (from ecn_commission_types)' })
  commissionType: EcnCommissionType;

  @ManyToOne<EcnCommissionLotsMode>(() => EcnCommissionLotsMode, mode => mode.id)
  @JoinColumn({ name: 'commission_lots_mode' })
  @Column('tinyint', { default: 3, comment: 'commission lots mode (from ecn_commission_lots_mode)' })
  commissionLotsMode: EcnCommissionLotsMode;

  @Column('bigint', { unsigned: true, nullable: true, default: 0, comment: 'last rollover UNIX datetime' })
  rolloverTime?: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0, comment: 'turnover commission value' })
  commissionTurnover: string;

  @ManyToOne<EcnModule>(() => EcnModule, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'margin_module_id' })
  @Column('int', { default: 0, comment: 'margin module id', name: 'margin_module_id' })
  marginModule: EcnModule;

  @ManyToOne(() => UsersInstCompany, company => company.id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  @Column('int', { unsigned: true, nullable: true, default: 1, name: 'company_id' })
  company?: UsersInstCompany;

  @Column('int', { unsigned: true, nullable: true, default: 0 })
  trId?: number;

  @Column('tinyint', { width: 1, default: 1 })
  fixTradingEnabled: number;

  @Column('tinyint', { width: 1, default: 0 })
  fixUserinfoRequestsEnabled: number;

  @Column('tinyint', { width: 1, default: 0 })
  alwaysBookA: number;

  @Column('decimal', { precision: 18, scale: 8, default: '1.00000000', comment: 'hedge factor' })
  hedgeFactor: string;
}
