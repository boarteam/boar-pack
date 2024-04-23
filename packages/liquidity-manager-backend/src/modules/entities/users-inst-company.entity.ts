import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersInst } from '../users-inst/entities/users-inst.entity';

@Entity('users_inst_company')
export class UsersInstCompany {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 50, nullable: true })
  name: string;

  @OneToMany(() => UsersInst, usersInst => usersInst.commissionType)
  usersInst: UsersInst[];
}
