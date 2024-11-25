import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dcl_order_book_type')
export class DclOrderBookType {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'order_book_type_id'
  })
  id: number;

  @Column({
    length: 50,
    name: 'obt_name',
  })
  name: string;

  @Column({
    length: 256,
    nullable: true,
    name: 'obt_descr',
  })
  descr: string;
}
