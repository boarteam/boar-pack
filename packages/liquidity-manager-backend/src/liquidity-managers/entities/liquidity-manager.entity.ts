import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';

export enum LiquidityManagerWorkers {
  LM_WORKER_1 = 'lm_worker_1',
  LM_WORKER_2 = 'lm_worker_2',
  LM_WORKER_3 = 'lm_worker_3',
  LM_WORKER_4 = 'lm_worker_4',
  LM_WORKER_5 = 'lm_worker_5',
  LM_WORKER_6 = 'lm_worker_6',
  LM_WORKER_7 = 'lm_worker_7',
  LM_WORKER_8 = 'lm_worker_8',
  LM_WORKER_9 = 'lm_worker_9',
  LM_WORKER_10 = 'lm_worker_10',
}

export enum Colors {
  RED = 'red',
  VOLCANO = 'volcano',
  GOLD = 'gold',
  YELLOW = 'yellow',
  LIME = 'lime',
  GREEN = 'green',
  CYAN = 'cyan',
  BLUE = 'blue',
  GEEKBLUE = 'geekblue',
  PURPLE = 'purple',
  MAGENTA = 'magenta',
}

export const WORKER_UNIQUE_CONSTRAINT = 'UQ_liquidity_managers_worker';

@Entity('liquidity_managers')
@Unique(WORKER_UNIQUE_CONSTRAINT, ['worker'])
export class LiquidityManager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column()
  user: string;

  @Column()
  pass: string;

  @Column()
  database: string;

  @Column({
    type: 'enum',
    enum: LiquidityManagerWorkers,
  })
  worker: LiquidityManagerWorkers;

  @Column({
    type: 'enum',
    enum: Colors,
  })
  color: Colors;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
