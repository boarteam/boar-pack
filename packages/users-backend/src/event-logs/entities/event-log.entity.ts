import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { User } from "../../users";

export enum LogType {
  AUDIT = 'Audit',
  OPERATIONAL = 'Operational',
  APPLICATION = 'Application',
}

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  GUEST = 'Guest',
  SYSTEM = 'System',
}

export enum LogLevel {
  INFO = 'Info',
  WARNING = 'Warning',
  ERROR = 'Error',
}

@Entity('event_logs')
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LogType,
  })
  logType: LogType;

  @Column({
    type: 'enum',
    enum: LogLevel,
  })
  logLevel: LogLevel;

  @Column()
  action: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  method: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  @ManyToOne(() => User)
  user: User | null;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userRole: UserRole;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  userName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  externalUserId: string | null;

  @Column()
  entity: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  entityId: string | null;

  @Column('jsonb', { nullable: true })
  payload: Record<string, any> | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  url: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    type: 'varchar',
    nullable: true
  })
  userAgent: string | null;

  @Column('int', {
    nullable: true,
  })
  duration: number | null;

  @Column('int', {
    nullable: true,
  })
  statusCode: number | null;

  @Index('event_logs_service_index')
  @Column({
    default: 'main'
  })
  service: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  serviceId: string | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at'
  })
  updatedAt: Date;
}
