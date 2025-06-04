import { Controller, Get, Req, Res, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { SkipJWTGuard } from '../../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../../casl/policies.guard';
import { YandexAuthGuard } from './yandex-auth.guard';
import { AuthExceptionFilter } from '../auth.exception-filter';

@SkipPoliciesGuard()
@ApiTags('Authentication')
@Controller('auth/yandex')
export default class YandexAuthController {
  constructor(private authService: AuthService) {
  }

  @SkipJWTGuard()
  @UseGuards(YandexAuthGuard)
  @Get('')
  async loginYandex() {
  }

  @SkipJWTGuard()
  @UseGuards(YandexAuthGuard)
  @UseFilters(AuthExceptionFilter)
  @Get('callback')
  async loginYandexCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    const loginResult = await this.authService.login(req.user);
    this.authService.setCookie(res, loginResult.accessToken);
    res.redirect('/');
  }
}
