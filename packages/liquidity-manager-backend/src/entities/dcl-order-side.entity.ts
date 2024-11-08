import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dcl_order_side')
export class DclOrderSide {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'order_side_id'
  })
  id: number;

  @Column({
    length: 64,
  })
  name: string;

  @Column({
    length: 128,
    nullable: true,
  })
  descr: string;
}
