import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { UsersInst } from '../../users-inst/entities/users-inst.entity';

@Entity('users_sub_account_inst')
@Unique('uidx_userid_sub_account_id', ['userId', 'subAccountId'])
@Index('idx_usai_sub_account_id', ['subAccountId'])
@Index('idx_usai_userid', ['userId'])
export class UsersSubAccountInst {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'unique Id' })
  id: string;

  @Column('bigint', { unsigned: true, default: 0, comment: 'unique sub account id for user' })
  subAccountId: string;

  @Column('varchar', { length: 96, comment: 'user sub account description' })
  descr: string;

  @Column('bigint', { unsigned: true, default: 0, comment: 'unique user id', name: 'userid' })
  userId: string;

  @ManyToOne(() => UsersInst, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'userid' })
  user: UsersInst;
}
