import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { UsersGroupsInst } from '../users-groups-inst/entities/users-groups-inst.entity';

@Entity('dcl_actions')
export class DclAction {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column({ length: 256, comment: 'string action representation [required]' })
  name: string;

  @Column({ length: 512, nullable: true, comment: 'description' })
  descr: string;

  @OneToMany(() => UsersGroupsInst, usersGroupsInst => usersGroupsInst.action)
  usersGroups: UsersGroupsInst[];
}
