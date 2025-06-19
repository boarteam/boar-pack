import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('api_statistic')
@Index('idx_created_service_name', ['createdAt', 'serviceName'], { unique: false })
export class ApiStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column({
    name: 'last_checked_at',
    type: 'timestamp with time zone',
  })
  lastCheckedAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
