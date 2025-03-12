import { Injectable, Logger } from '@nestjs/common';
import { TUser, UsersService } from '../users';
import { JWTAuthService, TJWTPayload } from '../jwt-auth';
import bcrypt from 'bcrypt';
import { LocalAuthTokenDto } from "./password/local-auth.dto";

declare global {
  namespace Express {
    interface User extends TUser {}
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtAuthService: JWTAuthService,
  ) {}

  async validateUser(email: string, pass: string): Promise<TUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user?.pass) {
      return null;
    }

    if (user && (await bcrypt.compare(pass, user.pass))) {
      const { pass, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByEmail(email?: string): Promise<TUser | null> {
    if (!email) {
      this.logger.error('Email is not provided to validateUserByEmail');
      return null;
    }

    const user = await this.usersService.findByEmail(email);
    if (user) {
      const { pass, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Pick<TUser, 'email' | 'id'>): Promise<LocalAuthTokenDto> {
    const payload: TJWTPayload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtAuthService.sign(payload),
    };
  }
}
