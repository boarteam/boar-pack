import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EcnConnectSchema } from '../../ecn-connect-schema/entities/ecn-connect-schema.entity';
import { EcnInstrument } from '../../ecn-instruments/entities/ecn-instrument.entity';
import { EcnExecutionMode } from './ecn-execution-mode.entity';

@Entity('ecn_subscr_schema')
export class EcnSubscrSchema {
  @PrimaryColumn('int', { comment: 'Connection Schema Id' })
  connectSchemaId: number;

  @PrimaryColumn('bigint', { unsigned: true, comment: 'Symbol id (hash)' })
  instrumentHash: string;

  @Column('tinyint', { default: 1, comment: 'Enabled/disabled switcher' })
  enabled: number;

  @Column('int', { default: 0, comment: 'Markup bid' })
  markupBid: number;

  @Column('int', { default: 0, comment: 'Default markup bid' })
  defaultMarkupBid: number;

  @Column('int', { default: 0, comment: 'Markup ask' })
  markupAsk: number;

  @Column('int', { default: 0, comment: 'Default markup ask' })
  defaultMarkupAsk: number;

  @Column('decimal', { precision: 18, scale: 8, comment: 'Minimum volume which module can process at once for the symbol' })
  minVolume: string;

  @Column('decimal', { precision: 18, scale: 8, comment: 'Maximum volume which module can process at once for the symbol' })
  maxVolume: string;

  @Column('decimal', { precision: 18, scale: 8, comment: 'Minimal volume step' })
  volumeStep: string;

  @Column('tinyint', { default: 1, comment: 'Instrument weight' })
  instrumentWeight: number;

  @ManyToOne(() => EcnExecutionMode)
  @JoinColumn({ name: 'execution_mode' })
  @Column('tinyint', { default: 1, comment: 'Instrument execution mode (Instant or Market)' })
  executionMode: EcnExecutionMode;

  @Column('varchar', { length: 512, nullable: true, comment: 'Description' })
  descr?: string;

  @Column('tinyint', { default: 0 })
  reserved: number;

  @Column('tinyint', { default: 1 })
  tradeEnabled: number;

  @ManyToOne(() => EcnConnectSchema)
  @JoinColumn({ name: 'connect_schema_id' })
  connectSchema: EcnConnectSchema;

  @ManyToOne(() => EcnInstrument)
  @JoinColumn({ name: 'instrument_hash' })
  instrument: EcnInstrument;
}
