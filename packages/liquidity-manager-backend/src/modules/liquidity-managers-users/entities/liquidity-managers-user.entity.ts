import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { LiquidityManager } from "../../liquidity-managers";
import { User } from "@jifeon/boar-pack-users-backend";
import type { User as UserType } from "@jifeon/boar-pack-users-backend";

export enum LiquidityManagersUserRoles {
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

@Entity('liquidity_managers_users')
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
