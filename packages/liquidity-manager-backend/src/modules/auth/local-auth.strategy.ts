import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AMTSUser, AuthService } from './auth.service';
import { LOCAL_AUTH } from './auth-strategies.constants';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, LOCAL_AUTH) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'name' });
  }

  async validate(id: string, password: string): Promise<AMTSUser> {
    const user = await this.authService.validateUser(id, password);
    if (!user) {
      throw new UnauthorizedException('You have been logged out, please login again');
    }
    return user;
  }
}
