import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TUser } from '../users/entities/user.entity';
import { LOCAL_AUTH } from './auth-strategies.constants';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, LOCAL_AUTH) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<TUser> {
    const user = await this.authService.validateUser(email.trim().toLowerCase(), password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
