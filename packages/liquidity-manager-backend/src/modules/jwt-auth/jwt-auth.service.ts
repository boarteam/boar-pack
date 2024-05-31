import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { TJWTPayload } from "./jwt-auth.srtategy";

@Injectable()
export class JWTAuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {
  }

  sign(payload: TJWTPayload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  decode<T = TJWTPayload>(token: string): T {
    return this.jwtService.decode(token) as T;
  }
}
