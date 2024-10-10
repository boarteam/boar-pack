import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EcnModuleType } from "../../ecn-module-types/entities/ecn-module-type.entity";
import { EcnConnectSchemaSetupLabel } from "../../ecn-connect-schema-setup-labels/entities/ecn-connect-schema-setup-label.entity";
import { EcnConnectSchema } from "../../ecn-connect-schema/entities/ecn-connect-schema.entity";
import { UsersInst } from "../../users-inst/entities/users-inst.entity";

@Entity('ecn_modules')
export class EcnModule {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: 'Module id [required]',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 256,
    comment: 'Module name'
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: 'Description'
  })
  descr: string | null;

  @ManyToOne<EcnModuleType>(() => EcnModuleType, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'type',
    referencedColumnName: 'id',
  })
  type: EcnModuleType;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: 'Enabled/disabled switcher'
  })
  enabled: number;

  @ManyToMany<EcnConnectSchemaSetupLabel>(() => EcnConnectSchemaSetupLabel, setupLabel => setupLabel.modules)
  setupLabels: EcnConnectSchemaSetupLabel[];

  @OneToMany(() => EcnConnectSchema, connection => connection.fromModule)
  outgoingConnections: EcnConnectSchema[];

  @OneToMany(() => EcnConnectSchema, connection => connection.toModule)
  incomingConnections: EcnConnectSchema[];

  @OneToMany<UsersInst>(() => UsersInst, userInst => userInst.module)
  accessForUsers: UsersInst[];

  @OneToMany<UsersInst>(() => UsersInst, userInst => userInst.marginModuleId)
  marginForUsers: UsersInst[];
}
