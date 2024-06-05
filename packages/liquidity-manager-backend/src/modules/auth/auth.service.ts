import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
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

  async resetPassword(user: AMTSUser, password: string): Promise<void> {
    const userId = user.id;
    const storedUser = await this.usersService.findById(userId);
    if (!storedUser) {
      throw new NotFoundException('User not found');
    }

    if (storedUser.pwdHashTypeId !== EcnPasswordHashType.MD5 && storedUser.pwdHashTypeId !== EcnPasswordHashType.BCRYPT) {
      throw new UnprocessableEntityException('Unknown password hash type');
    }

    await this.usersService.updatePassword(await this.usersService.generatePassword({
      id: userId,
      password,
      pwdHashTypeId: storedUser.pwdHashTypeId,
    }));
  }
}
