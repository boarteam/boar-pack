import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { UsersGroupsInst } from '../modules/users-groups-inst/entities/users-groups-inst.entity';

@Entity('ecn_working_modes')
export class EcnWorkingMode {
  @PrimaryGeneratedColumn({ type: 'int', comment: 'working mode ID [required]' })
  id: number;

  @Column({ length: 12, comment: 'string working mode representation [required]' })
  name: string;

  @OneToMany(() => UsersGroupsInst, usersGroupsInst => usersGroupsInst.action)
  usersGroups: UsersGroupsInst[];
}
