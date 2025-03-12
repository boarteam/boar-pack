import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards, } from '@nestjs/common';
import { LocalAuthGuard } from './password/local-auth.guard';
import { AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { JwtAuthGuard, SkipJWTGuard } from '../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../casl/policies.guard';
import { GoogleAuthGuard } from './google/google-auth.guard';
import { AuthExceptionFilter } from './google/google-auth.filter';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LocalAuthLoginDto, LocalAuthTokenDto } from "./password/local-auth.dto";
import { MSAuthGuard } from "./microsoft/ms-auth.guard";

@SkipPoliciesGuard()
@ApiTags('Authentication')
@ApiExtraModels(LocalAuthTokenDto)
@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

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

  @Post('token')
  @UseGuards(JwtAuthGuard)
  async token(
    @Req() req: Request,
  ): Promise<LocalAuthTokenDto> {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }
    return this.authService.login(req.user);
  }

  @SkipJWTGuard()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async loginGoogle() {}

  @SkipJWTGuard()
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

  @SkipJWTGuard()
  @UseGuards(MSAuthGuard)
  @Get('ms')
  async loginMS() {}

  @SkipJWTGuard()
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

  @SkipJWTGuard()
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie(tokenName, '');
  }
}
