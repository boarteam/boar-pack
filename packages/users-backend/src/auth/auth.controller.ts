import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards, } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { SkipJWTGuard } from '../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../casl/policies.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthExceptionFilter } from './google-auth.filter';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LocalAuthLoginDto, LocalAuthTokenDto } from "./local-auth.dto";
import { MSAuthGuard } from "./ms-auth.guard";

@SkipJWTGuard()
@SkipPoliciesGuard()
@ApiTags('Authentication')
@ApiExtraModels(LocalAuthTokenDto)
@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async loginGoogle() {}

  @UseGuards(GoogleAuthGuard)
  @UseFilters(AuthExceptionFilter)
  @Get('google/callback')
  async loginGoogleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    const loginResult = await this.authService.login(req.user);
    res.cookie(tokenName, loginResult.accessToken);
    res.redirect('/');
  }

  @UseGuards(MSAuthGuard)
  @Get('ms')
  async loginMS() {}

  @UseGuards(MSAuthGuard)
  @UseFilters(AuthExceptionFilter)
  @Get('ms/callback')
  async loginMSCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    const loginResult = await this.authService.login(req.user);
    res.cookie(tokenName, loginResult.accessToken);
    res.redirect('/');
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie(tokenName, '');
  }
}
