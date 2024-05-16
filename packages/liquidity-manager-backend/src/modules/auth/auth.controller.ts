import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { SkipJWTGuard } from '../jwt-auth';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LocalAuthLoginDto, LocalAuthTokenDto } from "./local-auth.dto";
import { SkipPoliciesGuard } from "@jifeon/boar-pack-users-backend";
import { UsersInst } from "../users-inst/entities/users-inst.entity";

@SkipPoliciesGuard()
@ApiTags('AMTS Authentication')
@ApiExtraModels(LocalAuthTokenDto)
@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  async me(
    @Req() req: Request,
  ): Promise<UsersInst> {
    console.log('req.user', req.user);
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }
    const user = await this.authService.me(req.user);
    if (!user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    return user;
  }

  @SkipJWTGuard()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LocalAuthLoginDto,
  ): Promise<LocalAuthTokenDto> {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }
    const loginResult = await this.authService.login(req.user);
    res.cookie(tokenName, loginResult.accessToken);
    return loginResult;
  }

  @SkipJWTGuard()
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie(tokenName, '');
  }
}
