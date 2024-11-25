import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dcl_order_type')
export class DclOrderType {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'order_type_id'
  })
  id: number;

  @Column({
    length: 50,
    name: 'otp_name',
  })
  name: string;

  @Column({
    length: 256,
    nullable: true,
    name: 'otp_descr',
  })
  descr: string;
}
