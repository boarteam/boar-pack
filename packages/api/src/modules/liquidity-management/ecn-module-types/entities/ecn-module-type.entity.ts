import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("ecn_module_types")
export class EcnModuleType {
  @PrimaryGeneratedColumn({
    type: "tinyint",
    comment: "Unique module type ID [required]"
  })
  id: number;

  @Column({
    type: "varchar",
    length: 256,
    comment: "Module type name [required]"
  })
  name: string;

  @Column({
    type: "varchar",
    length: 512,
    nullable: true,
    comment: "Description"
  })
  descr: string | null;
}
