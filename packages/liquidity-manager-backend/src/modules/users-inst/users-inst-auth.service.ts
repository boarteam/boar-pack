import { Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UsersInstAuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  generatePasswordResetToken(userId: string): string {
    return this.jwtService.sign({ sub: userId }, {
      expiresIn: '1d',
    });
  }
}
