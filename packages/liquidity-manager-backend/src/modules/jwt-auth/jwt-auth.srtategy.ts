import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTAuthConfigService } from './jwt-auth.config';
import { Request } from 'express';
import { JWT_AUTH, tokenName } from '../auth';
import { UsersInstService } from "../users-inst/users-inst.service";

export type TJWTPayload = {
  name: string;
  sub: string;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, JWT_AUTH) {
  constructor(
    private usersService: UsersInstService,
    private jwtAuthConfigService: JWTAuthConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req.headers.cookie?.split('; ');
          if (!cookies) {
            return null;
          }

          const cookie = cookies.find(c => c.startsWith(`${tokenName}=`));
          if (!cookie) {
            return null;
          }

          return cookie.split('=')[1];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtAuthConfigService.config.jwtSecret,
    });
  }

  async validate(payload: TJWTPayload) {
    const userId = payload.sub;
    const user = await this.usersService.findOne({
      select: ['id', 'name'],
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
