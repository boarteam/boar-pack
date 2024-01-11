import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EcnModule } from "../../ecn-modules/entities/ecn-module.entity";

@Entity('ecn_connect_schema_setup_labels')
export class EcnConnectSchemaSetupLabel {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 64,
  })
  label: string;

  @ManyToMany<EcnModule>(() => EcnModule, module => module.setupLabels, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'ecn_connect_schema_setup',
    joinColumn: {
      name: 'label_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'module_id',
      referencedColumnName: 'id',
    },
  })
  modules: EcnModule[];
}
