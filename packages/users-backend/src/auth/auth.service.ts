import { Injectable, Logger } from '@nestjs/common';
import { TUser, UsersService } from '../users';
import { JWTAuthService, TJWTPayload, TJWTRefreshPayload } from '../jwt-auth';
import bcrypt from 'bcrypt';
import { LocalAuthTokenDto } from "./local-auth/local-auth.dto";
import { Response } from 'express';
import { refreshTokenName, tokenName } from "./auth.constants";
import { AuthConfigService, TAuthConfig } from "./auth.config";
import { TOKEN_TYPE } from "../revoked-tokens";

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
      this.logger.warn('JWT does not have JTI or exp, cannot revoke it');
      return;
    }

    await this.jwtAuthService.revokeToken({
      jti: jwt.jti,
      expiresAt: new Date(jwt.exp * 1000),
      tokenType: TOKEN_TYPE.ACCESS,
      sid: jwt.sid || null,
    });
    this.logger.log(`User with id ${jwt.sub} has been logged out and token revoked`);
  }

  public setCookie(res: Response, tokens: LocalAuthTokenDto): void {
    res.cookie(tokenName, tokens.accessToken.token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
      maxAge: tokens.accessToken.payload.exp && Math.max((tokens.accessToken.payload.exp * 1000) - Date.now(), 0),
    });

    res.cookie(refreshTokenName, tokens.refreshToken.token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
      maxAge: tokens.refreshToken.payload.exp && Math.max((tokens.refreshToken.payload.exp * 1000) - Date.now(), 0),
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
