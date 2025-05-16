import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserConnectionTarget {
  FIX_SERVER = 'fix-server',
  WEBSOCKET_SERVER = 'websocket-server',
}

@Entity('users_connections_statistic')
export class UsersConnectionsStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  userId: string;

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
