import { Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard, SkipJWTGuard } from '../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../casl/policies.guard';
import { LocalAuthTokenDto } from "./local-auth/local-auth.dto";
import { JwtAuthRefreshGuard } from "../jwt-auth/jwt-auth.refresh.guard";

@SkipPoliciesGuard()
@ApiTags('Authentication')
@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {
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

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.jwt) {
      await this.authService.logout(req.jwt);
    }

    this.authService.clearCookies(res);
  }

  @SkipJWTGuard()
  @UseGuards(JwtAuthRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    const tokens = await this.authService.login(req.user);
    this.authService.setCookie(res, tokens);
  }
}
