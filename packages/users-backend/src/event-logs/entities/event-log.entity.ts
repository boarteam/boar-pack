import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  SERVICE_START = 'SERVICE_START',
  SERVICE_STOP = 'SERVICE_STOP',
}

export enum LogType {
  AUDIT = 'AUDIT',
  OPERATIONAL = 'OPERATIONAL',
  APPLICATION = 'APPLICATION',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
  SYSTEM = 'SYSTEM',
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
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    nullable: true,
  })
  userId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userRole: string;

  @Column()
  entity: string;

  @Column({
    nullable: true,
  })
  entityId: string;

  @Column('jsonb', { nullable: true })
  payload: Record<string, any>;

  @Column({
    nullable: true,
  })
  url: string;

  @Column({
    nullable: true,
  })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column('int', {
    nullable: true,
  })
  duration: number;

  @Column('int', {
    nullable: true,
  })
  statusCode: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
