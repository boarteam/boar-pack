import { Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { JwtAuthGuard, SkipJWTGuard } from '../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../casl/policies.guard';
import { LocalAuthTokenDto } from "./local-auth/local-auth.dto";

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

  @SkipJWTGuard()
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie(tokenName, '');
  }
}
