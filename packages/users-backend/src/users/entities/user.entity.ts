import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
import { SubjectRawRule } from '@casl/ability';
import { PackRule } from '@casl/ability/extra';
import { Action } from '../../casl/action.enum';
import { TSubjectsNames } from '../../casl/casl-ability.factory';

export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}

export const EMAIL_UNIQUE_CONSTRAINT = 'UQ_users_email';

export type TUser = Omit<User, 'pass'>;

export enum Permissions {
  VIEW_USERS = 'view_users',
  VIEW_QUOTES_MONITOR = 'view_quotes_monitor',
  VIEW_INSTRUMENTS_GROUPS = 'view_instruments_groups',
  MANAGE_INSTRUMENTS_GROUPS = 'manage_instruments_groups',
  VIEW_STORED_FILTERS = 'view_stored_filters',
  MANAGE_STORED_FILTERS = 'manage_stored_filters',
  VIEW_TRADING_PLATFORMS = 'view_trading_platforms',
  MANAGE_TRADING_PLATFORMS = 'manage_trading_platforms',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_LIQUIDITY = 'view_liquidity',
  MANAGE_LIQUIDITY = 'manage_liquidity',
}

@Entity('users')
@Unique(EMAIL_UNIQUE_CONSTRAINT, ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles;

  @Column({ type: 'varchar', nullable: true })
  pass: string | null;

  @Column({
    type: 'enum',
    enum: Permissions,
    array: true,
    default: [],
  })
  permissions: Permissions[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  policies: PackRule<SubjectRawRule<Action, TSubjectsNames, unknown>>[];
}
