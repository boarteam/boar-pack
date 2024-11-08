import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dcl_order_state')
export class DclOrderState {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'order_state_id'
  })
  id: number;

  @Column({
    length: 50,
    name: 'ost_name',
  })
  name: string;

  @Column({
    length: 256,
    nullable: true,
    name: 'ost_descr',
  })
  descr: string;
}
