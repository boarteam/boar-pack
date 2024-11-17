import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AMTSUser, AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { SkipJWTGuard } from '../jwt-auth';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LocalAuthLoginDto, LocalAuthTokenDto } from "./dto/local-auth.dto";
import { CaslAbilityFactory, SkipPoliciesGuard } from "@jifeon/boar-pack-users-backend";
import { JwtUriAuthGuard } from "../jwt-auth/jwt-uri-auth.guard";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JWTUriExceptionFilter } from "../jwt-auth/jwt-uri.exception-filter";

@SkipPoliciesGuard()
@ApiTags('AMTS Authentication')
@ApiExtraModels(LocalAuthTokenDto, AMTSUser)
@Controller('auth')
export default class AuthController {
  constructor(
    private authService: AuthService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Get('me')
  async me(
    @Req() req: Request,
  ): Promise<AMTSUser> {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }
    const user = await this.authService.me(req.user);
    if (!user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    const ability = await this.caslAbilityFactory.createForUser(req.user);

    return {
      id: user.id,
      name: user.name,
      role: req.user.role,
      permissions: req.user.permissions,
      policies: this.caslAbilityFactory.packAbility(ability),
    };
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
    const loginResult = await this.authService.login(req.user, body.rememberMe);
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

  @SkipJWTGuard()
  @UseGuards(JwtUriAuthGuard)
  @UseFilters(JWTUriExceptionFilter)
  @Post('reset-password/:token')
  async resetPassword(
    @Req() req: Request,
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }
    await this.authService.resetPassword(req.user, body.password);
  }

  @Post('reset-password')
  async resetUserPassword(
    @Req() req: Request,
    @Body() body: ResetPasswordDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }
    await this.authService.resetPassword(req.user, body.password);
  }
}
