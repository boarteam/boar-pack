import { Injectable, Logger } from '@nestjs/common';
import { TUser, UsersService } from '../users';
import { JWTAuthService, TJWTPayload, TJWTRefreshPayload, TOKEN_TYPE } from '../jwt-auth';
import bcrypt from 'bcrypt';
import { LocalAuthTokenDto } from "./local-auth/local-auth.dto";
import { Response } from 'express';
import { refreshTokenName, tokenName } from "./auth.constants";
import { AuthConfigService, TAuthConfig } from "./auth.config";

declare global {
  namespace Express {
    interface User extends TUser {}
    interface Request {
      jwt?: TJWTPayload;
    }
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly config: TAuthConfig;

  constructor(
    private usersService: UsersService,
    private jwtAuthService: JWTAuthService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.config = this.authConfigService.config;
  }

  async validateUser(email: string, pass: string): Promise<TUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user?.pass) {
      return null;
    }

    if (user && (await bcrypt.compare(pass, user.pass))) {
      const { pass, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByEmail(email?: string): Promise<TUser | null> {
    if (!email) {
      this.logger.error('Email is not provided to validateUserByEmail');
      return null;
    }

    const user = await this.usersService.findByEmail(email);
    if (user) {
      const { pass, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Pick<TUser, 'email' | 'id'>): Promise<LocalAuthTokenDto> {
    const sid = this.jwtAuthService.generateJwtId();
    const payload: TJWTPayload = {
      email: user.email,
      sub: user.id,
      sid,
    };
    const refreshPayload: TJWTRefreshPayload = {
      sub: user.id,
      sid,
    }
    return {
      accessToken: this.jwtAuthService.sign(payload, TOKEN_TYPE.ACCESS),
      refreshToken: this.jwtAuthService.sign(refreshPayload, TOKEN_TYPE.REFRESH),
    };
  }

  async logout(jwt: TJWTPayload): Promise<void> {
    if (!jwt.jti || !jwt.exp) {
      this.logger.warn('JWT does not have JTI or exp, cannot log out');
      return;
    }

    await this.jwtAuthService.revokeToken(jwt.jti, new Date(jwt.exp * 1000));
    this.logger.log(`User with id ${jwt.sub} has been logged out and token revoked`);
  }

  public setCookie(res: Response, tokens: LocalAuthTokenDto): void {
    res.cookie(tokenName, tokens.accessToken.token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
      maxAge: tokens.accessToken.payload.exp,
    });

    res.cookie(refreshTokenName, tokens.refreshToken.token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
      maxAge: tokens.refreshToken.payload.exp,
      path: this.config.refreshTokenPath,
    });
  }

  public clearCookies(res: Response): void {
    res.clearCookie(tokenName, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
    });
    res.clearCookie(refreshTokenName, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
      path: this.config.refreshTokenPath,
    });
  }
}
