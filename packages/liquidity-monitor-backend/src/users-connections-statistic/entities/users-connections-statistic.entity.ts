import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserConnectionTarget {
  FIX_SERVER = 'fix-server',
  WEBSOCKET_SERVER = 'websocket-server',
  TOKEN = 'token',
  ACCOUNT = 'account',
}

export type TComplexTarget = UserConnectionTarget.FIX_SERVER | UserConnectionTarget.WEBSOCKET_SERVER;

@Entity('users_connections_statistic')
export class UsersConnectionsStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @deprecated use targetId instead
   * Will be removed after migration to targetId
   */
  @Column({
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  /**
   * Identifier of the target (e.g., user id, token id, account id, etc.)
   */
  @Column({
    type: 'uuid',
    nullable: true, // convert to false after migration
  })
  targetId: string | null;

  @Column({
    type: 'enum',
    enum: UserConnectionTarget,
  })
  target: UserConnectionTarget;

  @Column({ type: 'int', name: 'quotes_number' })
  quotesNumber: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  createdAt: Date;
}
