import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum InstrumentsHistoryState {
  TID_DOWN = 'tid down',
  PLATFORM_DOWN = 'platform down',
  NO_QUOTES_REAL = 'no quotes real',
  SCHEDULED_OFF_QUOTES = 'scheduled off quotes',
  ACTIVE = 'active',
}

@Entity('instruments_history')
@Index('idx_instruments_history_filtering', ['createdAt', 'providerId', 'instrumentsGroupId'], {
  unique: false,
})
@Index('idx_created', ['createdAt'], {
  unique: false,
})
export class InstrumentsHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'symbol_name' })
  symbolName: string;

  @Column({ type: 'uuid', name: 'instruments_group_id' })
  instrumentsGroupId: string;

  @Column({ type: 'uuid', name: 'provider_id' })
  providerId: string;

  @Column({
    type: 'enum',
    enum: InstrumentsHistoryState,
    name: 'state'
  })
  state: InstrumentsHistoryState;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  createdAt: Date;
}
