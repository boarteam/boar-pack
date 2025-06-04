import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TJWTPayload } from "./jwt-auth.srtategy";
import { RevokedTokensService } from '../revoked-tokens';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JWTAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private revokedTokensService: RevokedTokensService,
  ) {
  }

  sign(payload: TJWTPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '1h',
      jwtid: uuidv4(),
    });
  }

  decode<T = TJWTPayload>(token: string): T {
    return this.jwtService.decode(token) as T;
  }

  /**
   * Revoke a JWT token by its JTI
   * @param jti The JWT token identifier
   * @param expiresAt When the token naturally expires
   */
  async revokeToken(jti: string, expiresAt: Date) {
    return this.revokedTokensService.revokeToken(jti, expiresAt);
  }
}
