import { Entity, Column } from 'typeorm';
import { EcnInstrumentsGroup } from "./ecn-instruments-group.entity";

@Entity('ecn_instruments_groups_hts')
export class EcnInstrumentsGroupHistory extends EcnInstrumentsGroup {
  @Column({ type: 'int', comment: 'HID' })
  hid: number;

  @Column({ type: 'int', comment: 'Action' })
  haction: number;

  @Column({ type: 'int', comment: 'TS' })
  ts: number;
}