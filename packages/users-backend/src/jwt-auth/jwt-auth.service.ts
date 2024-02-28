import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TJWTPayload } from "./jwt-auth.srtategy";

@Injectable()
export class JWTAuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {
  }

  sign(payload: TJWTPayload): string {
    return this.jwtService.sign(payload);
  }

  decode<T = TJWTPayload>(token: string): T {
    return this.jwtService.decode(token) as T;
  }
}
