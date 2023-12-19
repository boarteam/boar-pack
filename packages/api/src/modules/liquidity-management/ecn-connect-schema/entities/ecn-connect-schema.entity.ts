import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EcnModule } from '../../ecn-modules/entities/ecn-module.entity';

@Entity('ecn_connect_schema')
@Unique('uidx_from_to_connection_schema_module', ['fromModuleId', 'toModuleId'])
export class EcnConnectSchema {
  @PrimaryGeneratedColumn({
    type: 'int',
    comment: 'Connection Id',
  })
  id: number;

  @Column('int', {
    comment: 'Subscriber module id',
    unsigned: true,
    name: 'from_moduleid',
  })
  fromModuleId: number;

  @Column('int', {
    comment: 'Publisher module id',
    unsigned: true,
    name: 'to_moduleid',
  })
  toModuleId: number;

  @Column('tinyint', {
    default: 1,
    comment: 'Enabled/disabled switcher',
  })
  enabled: number;

  @Column('varchar', {
    length: 512,
    nullable: true,
    comment: 'Description',
  })
  descr?: string;

  @ManyToOne(() => EcnModule)
  @JoinColumn({ name: 'from_moduleid' })
  fromModule: EcnModule;

  @ManyToOne(() => EcnModule)
  @JoinColumn({ name: 'to_moduleid' })
  toModule: EcnModule;
}
