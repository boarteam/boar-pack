import { Entity, Column } from 'typeorm';
import { EcnModule } from "./ecn-module.entity";

@Entity('ecn_modules_history')
export class EcnModulesHistory extends EcnModule {
  @Column({ type: 'int', comment: 'HID' })
  hid: number;

  @Column({ type: 'int', comment: 'TS' })
  ts: number;
}
