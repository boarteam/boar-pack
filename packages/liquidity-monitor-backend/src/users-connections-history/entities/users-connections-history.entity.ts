import { UserConnectionTarget } from '../../users-connections-statistic';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users_connections_history')
export class UsersConnectionsHistory {
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

  @Column({
    type: 'timestamp with time zone',
    name: 'connected_at',
  })
  connectedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'disconnected_at',
  })
  disconnectedAt: Date;
}
