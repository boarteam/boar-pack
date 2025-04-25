import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from '../auth.service';
import { tokenName } from '../auth.constants';
import { SkipJWTGuard } from '../../jwt-auth/jwt-auth.guard';
import { SkipPoliciesGuard } from '../../casl/policies.guard';
import { LocalAuthLoginDto, LocalAuthTokenDto } from "./local-auth.dto";

@SkipPoliciesGuard()
@ApiTags('Authentication')
@ApiExtraModels(LocalAuthTokenDto)
@Controller('auth')
export default class LocalAuthController {
  constructor(private authService: AuthService) {
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
}
