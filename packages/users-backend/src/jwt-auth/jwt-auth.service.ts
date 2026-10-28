import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TJWTPayload, TJWTRefreshPayload } from './jwt-auth.srtategy';
import { RevokedTokensService, TOKEN_TYPE, TRevokedToken } from '../revoked-tokens';
import { randomUUID } from 'node:crypto';
import { JWTAuthConfigService, TJWTAuthConfig } from './jwt-auth.config';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';
import ms from 'ms';

@Injectable()
export class JWTAuthService {
  private readonly config: TJWTAuthConfig;

  constructor(
    private readonly jwtService: JwtService,
    private revokedTokensService: RevokedTokensService,
    private readonly jwtAuthConfig: JWTAuthConfigService,
  ) {
    this.config = this.jwtAuthConfig.config;
  }

  public generateJwtId(): string {
    return randomUUID();
  }

  public sign<PayloadType extends TJWTPayload | TJWTRefreshPayload>(
    payload: PayloadType,
    tokenType: TOKEN_TYPE,
  ) {
    const expiresIn =
      tokenType === TOKEN_TYPE.ACCESS
        ? this.config.accessTokenExpiration
        : this.config.refreshTokenExpiration;
    const options: JwtSignOptions = {
      expiresIn,
      jwtid: this.generateJwtId(),
    };
    // The token type is part of the signed payload: access and refresh tokens share
    // a secret, and the strategies reject a token presented as the wrong type
    const signedPayload = { ...payload, type: tokenType };
    return {
      token: this.jwtService.sign(signedPayload, options),
      payload: {
        ...signedPayload,
        exp: Math.floor((ms(expiresIn) + Date.now()) / 1000),
        jti: options.jwtid,
        sid: payload.sid,
      } as PayloadType,
    };
  }

  public decode<T = TJWTPayload>(token: string): T {
    return this.jwtService.decode(token) as T;
  }

  /**
   * Revoke a JWT token by its JTI
   * @param token The token to revoke
   */
  public async revokeToken(token: TRevokedToken) {
    return this.revokedTokensService.revokeToken(token, this.config.refreshTokenExpiration);
  }
}
