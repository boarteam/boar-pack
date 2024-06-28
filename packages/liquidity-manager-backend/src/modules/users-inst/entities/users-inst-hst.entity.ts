import { Entity, Column } from 'typeorm';
import { UsersInst } from "./users-inst.entity";

@Entity('uesrs_inst_hst')
export class UsersInstHistory extends UsersInst {
  @Column({ type: 'int', comment: 'HID' })
  hid: number;

  @Column({ type: 'int', comment: 'Action' })
  haction: number;

  @Column({ type: 'int', comment: 'TS' })
  hts: number;
}
