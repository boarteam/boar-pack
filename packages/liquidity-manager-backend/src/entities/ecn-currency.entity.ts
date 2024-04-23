import { Entity, PrimaryColumn } from 'typeorm';

@Entity('ecn_currency')
export class EcnCurrency {
  @PrimaryColumn('varchar', { length: 16, comment: 'currency name' })
  name: string;
}
