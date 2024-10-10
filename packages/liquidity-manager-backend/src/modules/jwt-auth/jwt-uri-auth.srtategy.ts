import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTAuthConfigService } from './jwt-auth.config';
import { Request } from 'express';
import { AMTSUser, JWT_URI_AUTH } from '../auth';
import { UsersInstService } from "../users-inst/users-inst.service";
import { Roles } from "@jifeon/boar-pack-users-backend";
import { Permissions } from "../casl-permissions";
import { MyInstrumentsPermissions } from "../my-instruments/my-instruments.permissions";
import { defaultPermissions } from "./default-permissions";

export type TJWTPayload = {
  sub: string;
};

@Injectable()
export class JwtUriAuthStrategy extends PassportStrategy(Strategy, JWT_URI_AUTH) {
  constructor(
    private usersService: UsersInstService,
    private jwtAuthConfigService: JWTAuthConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.params.token;
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
      console.log('User not found, id:', userId);
      throw new UnauthorizedException({ messageText: 'Your token is invalid or expired' });
    }

    return {
      id: user.id,
      name: user.name,
      role: Roles.USER,
      permissions: defaultPermissions,
    };
  }
}
