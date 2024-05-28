import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AMTSUser, AuthService } from './auth.service';
import { tokenName } from './auth.constants';
import { SkipJWTGuard } from '../jwt-auth';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LocalAuthLoginDto, LocalAuthTokenDto } from "./local-auth.dto";
import { CaslAbilityFactory, SkipPoliciesGuard } from "@jifeon/boar-pack-users-backend";

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

    const ability = this.caslAbilityFactory.createForUser(req.user);

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
