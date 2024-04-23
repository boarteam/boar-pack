import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UsersGroupsInst } from '../users-groups-inst/entities/users-groups-inst.entity';

@Entity('ecn_currency')
export class EcnCurrency {
  @PrimaryColumn('varchar', { length: 16, comment: 'currency name' })
  name: string;

  @OneToMany(() => UsersGroupsInst, usersGroupsInst => usersGroupsInst.action)
  usersGroups: UsersGroupsInst[];
}
