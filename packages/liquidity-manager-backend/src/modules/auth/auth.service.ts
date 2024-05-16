import { Injectable } from '@nestjs/common';
import { JWTAuthService, TJWTPayload } from '../jwt-auth';
import { UsersInstService } from '../users-inst/users-inst.service';
import { LocalAuthTokenDto } from "./local-auth.dto";
import { UsersInst } from "../users-inst/entities/users-inst.entity";

export interface AMTSUser {
  id: string;
  name: string;
}

declare global {
  namespace Express {
    interface User extends AMTSUser {}
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersInstService,
    private jwtAuthService: JWTAuthService,
  ) {}

  async validateUser(name: string, pass: string): Promise<AMTSUser | null> {
    const user = await this.usersService.findByName(name);
    if (!user?.password) {
      return null;
    }

    if (user && this.usersService.comparePasswordHash(name, pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: AMTSUser): Promise<LocalAuthTokenDto> {
    const payload: TJWTPayload = { name: user.name, sub: user.id };
    return {
      accessToken: this.jwtAuthService.sign(payload),
    };
  }

  me(user: AMTSUser): Promise<UsersInst|null> {
    return this.usersService.findOne({
      select: ['id', 'name'],
      where: { id: user.id },
    });
  }
}
