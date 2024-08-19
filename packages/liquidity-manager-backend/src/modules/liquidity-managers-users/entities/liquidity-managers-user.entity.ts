import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { LiquidityManager } from "../../liquidity-managers/entities/liquidity-manager.entity";
import { User } from "@jifeon/boar-pack-users-backend";
import type { User as UserType } from "@jifeon/boar-pack-users-backend";

export enum LiquidityManagersUserRoles {
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export const LIQUIDITY_MANAGER_USER_UNIQUE_CONSTRAINT = 'UQ_liquidity_managers_users_user_id';

@Entity('liquidity_managers_users')
@Unique(LIQUIDITY_MANAGER_USER_UNIQUE_CONSTRAINT, ['userId', 'liquidityManagerId'])
export class LiquidityManagersUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  liquidityManagerId: string;

  @ManyToOne(() => LiquidityManager, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  liquidityManager: LiquidityManager;

  @Column()
  userId: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserType;

  @Column({
    type: 'enum',
    enum: LiquidityManagersUserRoles,
    default: LiquidityManagersUserRoles.VIEWER,
  })
  role: LiquidityManagersUserRoles;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
