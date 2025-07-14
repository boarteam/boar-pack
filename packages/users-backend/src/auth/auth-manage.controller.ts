import { Controller, NotFoundException, Param, Post, Req, Res, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LocalAuthTokenDto } from "./local-auth/local-auth.dto";
import { CheckPolicies, ManageAllPolicy } from "../casl";
import { UsersService } from "../users";

@ApiTags('Authentication')
@CheckPolicies(new ManageAllPolicy())
@Controller('auth-manage')
export default class AuthManageController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login-as-user/:userId')
  async loginAsUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
  ): Promise<LocalAuthTokenDto> {
    const user = await this.usersService.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} is not found`);
    }

    const loginResult = await this.authService.login(user);
    this.authService.setCookie(res, loginResult.accessToken);
    return loginResult;
  }
}
