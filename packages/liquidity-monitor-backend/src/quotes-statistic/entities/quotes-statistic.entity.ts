import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('quotes_statistic')
@Index('idx_quotes_statistic_provider_created', ['quotesProviderName', 'createdAt'], {
  unique: false,
})
export class QuotesStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'quotes_provider_name' })
  quotesProviderName: string;

  @Column({ type: 'int', name: 'quotes_number' })
  quotesNumber: number;

  // Upcoming for providers, outcoming for user connections
  @Column({
    type: 'boolean',
    name: 'upcoming',
    nullable: false,
    default: false
  })
  upcoming: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at'
  })
  updatedAt: Date;
}
