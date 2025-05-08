import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('quotes_statistic')
export class QuotesStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'quotes_provider_name' })
  quotesProviderName: string;

  @Column({ type: 'int', name: 'quotes_number' })
  quotesNumber: number;

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
