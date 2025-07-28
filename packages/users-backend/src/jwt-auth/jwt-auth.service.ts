import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TJWTPayload, TJWTRefreshPayload } from "./jwt-auth.srtategy";
import { RevokedTokensService } from '../revoked-tokens';
import { v4 as uuidv4 } from 'uuid';
import { JWTAuthConfigService, TJWTAuthConfig } from "./jwt-auth.config";
import { JwtSignOptions } from "@nestjs/jwt/dist/interfaces";
import ms from 'ms';

export enum TOKEN_TYPE {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

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
    return uuidv4();
  }

  public sign<PayloadType extends TJWTPayload | TJWTRefreshPayload>(
    payload: PayloadType,
    tokenType: TOKEN_TYPE,
  ) {
    const expiresIn = tokenType === TOKEN_TYPE.ACCESS
      ? this.config.accessTokenExpiration
      : this.config.refreshTokenExpiration;
    const options: JwtSignOptions = {
      expiresIn,
      jwtid: this.generateJwtId(),
    }
    return {
      token: this.jwtService.sign(payload, options),
      payload: {
        ...payload,
        exp: ms(expiresIn),
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
   * @param jti The JWT token identifier
   * @param expiresAt When the token naturally expires
   */
  public async revokeToken(jti: string, expiresAt: Date) {
    return this.revokedTokensService.revokeToken(jti, expiresAt);
  }
}
