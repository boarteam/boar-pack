import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTAuthConfigService } from './jwt-auth.config';
import { Request } from 'express';
import { AMTSUser, JWT_AUTH, tokenName } from '../auth';
import { UsersInstService } from "../users-inst/users-inst.service";
import { Roles } from "@jifeon/boar-pack-users-backend";
import { Permissions } from "../casl-permissions";
import { defaultPermissions } from "./default-permissions";

export type TJWTPayload = {
  sub: string;
  rememberMe?: boolean;
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

  async validate(payload: TJWTPayload): Promise<AMTSUser> {
    const userId = payload.sub;
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      name: user.name,
      role: Roles.USER,
      permissions: defaultPermissions,
    };
  }
}
