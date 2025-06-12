import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index('IDX_REVOKED_TOKEN_JTI')
  jti: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
  })
  @Index('IDX_REVOKED_TOKEN_EXPIRES_AT')
  expiresAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
