import { Injectable } from '@nestjs/common';
import { JWTAuthService, TJWTPayload } from '../jwt-auth';
import { UsersInstService } from '../users-inst/users-inst.service';
import { LocalAuthTokenDto } from "./dto/local-auth.dto";
import { UsersInst } from "../users-inst/entities/users-inst.entity";
import { Roles, User } from "@jifeon/boar-pack-users-backend";
import { Permissions } from "../casl-permissions";
import { EcnPasswordHashType } from "../users-inst/users-inst.constants";

export class AMTSUser {
  id: string;
  name: string;
  role: User['role'];
  permissions: User['permissions'];
  policies?: User['policies'];
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

  async validateUser(id: string, pass: string): Promise<AMTSUser | null> {
    const user = await this.usersService.findById(id);
    if (!user?.password) {
      return null;
    }

    const response = {
      id: user.id,
      name: user.name,
      role: Roles.USER,
      permissions: [Permissions.VIEW_LIQUIDITY],
    };

    if (user.pwdHashTypeId === EcnPasswordHashType.MD5 && this.usersService.comparePasswordMd5Hash(id, pass, user.password)) {
      return response;
    } else if (user.pwdHashTypeId === EcnPasswordHashType.BCRYPT && await this.usersService.comparePasswordBcryptHash(pass, user.password)) {
      return response;
    }
    return null;
  }

  async login(user: AMTSUser): Promise<LocalAuthTokenDto> {
    const payload: TJWTPayload = { sub: user.id };
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
