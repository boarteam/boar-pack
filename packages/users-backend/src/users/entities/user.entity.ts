import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
import { SubjectRawRule } from '@casl/ability';
import { PackRule } from '@casl/ability/extra';
import { Action } from '../../casl/action.enum';
import { TSubjectsNames } from '../../casl/casl-ability.factory';
import { Permission } from './permissions';

export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}

export const EMAIL_UNIQUE_CONSTRAINT = 'UQ_users_email';

export type TUser = Omit<User, 'pass'>;

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
    type: 'varchar',
    array: true,
    default: [],
  })
  permissions: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  policies: PackRule<SubjectRawRule<Action, TSubjectsNames, unknown>>[];
}
