import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('providers_problematic_period')
@Index(['providerId', 'period'], { unique: false })
export class ProvidersProblematicPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'provider_id' })
  providerId: string;

  @Column({
    type: 'tstzrange',
    nullable: false,
  })
  period: string;
}
