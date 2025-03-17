import { Controller, Get, Req, Res, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { tokenName } from '../auth.constants';
import { SkipJWTGuard } from '../../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../../casl/policies.guard';
import { AuthExceptionFilter } from '../auth.exception-filter';
import { MSAuthGuard } from "./ms-auth.guard";

@SkipPoliciesGuard()
@ApiTags('Authentication')
@Controller('auth/ms')
export default class MsAuthController {
  constructor(private authService: AuthService) {
  }

  @SkipJWTGuard()
  @UseGuards(MSAuthGuard)
  @Get('')
  async loginMS() {
  }

  @SkipJWTGuard()
  @UseGuards(MSAuthGuard)
  @UseFilters(AuthExceptionFilter)
  @Get('callback')
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
}
