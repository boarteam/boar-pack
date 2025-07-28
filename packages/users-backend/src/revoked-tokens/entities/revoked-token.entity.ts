import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum TOKEN_TYPE {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity('revoked_tokens')
@Index('IDX_REVOKED_TOKEN_SID_TYPE', ['sid', 'tokenType'])
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    type: 'uuid',
  })
  @Index('IDX_REVOKED_TOKEN_JTI')
  jti: string;

  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  sid: string | null;

  @Column({
    type: 'enum',
    enum: TOKEN_TYPE,
    default: TOKEN_TYPE.ACCESS,
  })
  tokenType: TOKEN_TYPE;

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

export type TRevokedToken = Omit<RevokedToken, 'id' | 'createdAt'>;
