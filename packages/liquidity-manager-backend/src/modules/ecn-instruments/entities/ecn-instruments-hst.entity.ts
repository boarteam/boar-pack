import { Entity, Column } from 'typeorm';
import { EcnInstrument } from "./ecn-instrument.entity";

@Entity('ecn_instruments_history')
export class EcnInstrumentsHistory extends EcnInstrument {
  @Column({ type: 'int', comment: 'HID' })
  hid: number;

  @Column({ type: 'int', comment: 'TS' })
  ts: number;
}
