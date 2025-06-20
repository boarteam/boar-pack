import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('api_statistic')
@Index(['serviceName', 'uptimePeriod'], { unique: false })
export class ApiStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column({
    name: 'uptime_period',
    type: 'tstzrange',
    nullable: false,
  })
  uptimePeriod: string;
}
