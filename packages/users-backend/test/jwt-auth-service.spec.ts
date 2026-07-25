// uuid v13 is ESM-only and cannot be require()d by jest's CJS runtime, so the
// dependency of jwt-auth.service.ts is mocked with an equivalent v4 generator.
jest.mock('uuid', () => ({
  v4: () => require('node:crypto').randomUUID(),
}));

import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import ms from 'ms';
import { JWTAuthService } from '../src/jwt-auth/jwt-auth.service';
import { JWTAuthConfigService } from '../src/jwt-auth/jwt-auth.config';
import {
  JwtAuthStrategy,
  TJWTPayload,
  TJWTRefreshPayload,
} from '../src/jwt-auth/jwt-auth.srtategy';
import { RevokedToken, TOKEN_TYPE } from '../src/revoked-tokens/entities/revoked-token.entity';
import { RevokedTokensService } from '../src/revoked-tokens/revoked-tokens.service';
import { UsersService } from '../src/users/users.service';
import { Roles, User } from '../src/users/entities/user.entity';
import { createTestDataSource } from './pg';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('JWTAuthService (Postgres-backed revocation)', () => {
  const ORIGINAL_ENV = { ...process.env };
  let ds: DataSource;
  let revokedTokensService: RevokedTokensService;
  let jwtService: JwtService;
  let service: JWTAuthService;
  let usersService: UsersService;
  let strategy: JwtAuthStrategy;
  let user: User;

  function buildService(): JWTAuthService {
    return new JWTAuthService(
      jwtService,
      revokedTokensService,
      new JWTAuthConfigService(new ConfigService()),
    );
  }

  beforeAll(async () => {
    ds = await createTestDataSource([User, RevokedToken]);
    revokedTokensService = new RevokedTokensService(ds.getRepository(RevokedToken));
    jwtService = new JwtService({ secret: process.env.JWT_SECRET });
    service = buildService();
    usersService = new UsersService(ds.getRepository(User));
    strategy = new JwtAuthStrategy(
      usersService,
      new JWTAuthConfigService(new ConfigService()),
      revokedTokensService,
    );
    user = await usersService.create({
      name: 'JWT Spec User',
      email: 'jwt-spec@test.test',
      role: Roles.USER,
    });
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  afterEach(() => {
    process.env.ACCESS_TOKEN_EXPIRATION = ORIGINAL_ENV.ACCESS_TOKEN_EXPIRATION;
    process.env.REFRESH_TOKEN_EXPIRATION = ORIGINAL_ENV.REFRESH_TOKEN_EXPIRATION;
  });

  function signAccess(sid = randomUUID()) {
    const payload: TJWTPayload = { email: user.email, sub: user.id, sid };
    return service.sign(payload, TOKEN_TYPE.ACCESS);
  }

  it('signs access tokens carrying email/sub/jti/sid with the env-configured 1h expiration', () => {
    const sid = randomUUID();
    const { token, payload } = signAccess(sid);

    const decoded = jwtService.verify<TJWTPayload>(token);
    expect(decoded.email).toBe(user.email);
    expect(decoded.sub).toBe(user.id);
    expect(decoded.sid).toBe(sid);
    expect(decoded.jti).toMatch(UUID_RE);
    // ACCESS_TOKEN_EXPIRATION=1h from setup-env
    expect((decoded.exp as number) - Number(decoded.iat)).toBe(ms('1h') / 1000);

    // The returned payload mirrors what went into the token
    expect(payload.jti).toBe(decoded.jti);
    expect(payload.sid).toBe(sid);
    expect(Math.abs((payload.exp as number) - (decoded.exp as number))).toBeLessThanOrEqual(2);
  });

  it('signs refresh tokens carrying sub/jti/sid (no email) with the 7d expiration', () => {
    const sid = randomUUID();
    const refreshPayload: TJWTRefreshPayload = { sub: user.id, sid };
    const { token, payload } = service.sign(refreshPayload, TOKEN_TYPE.REFRESH);

    const decoded = jwtService.verify<TJWTPayload>(token);
    expect(decoded.sub).toBe(user.id);
    expect(decoded.sid).toBe(sid);
    expect(decoded.jti).toMatch(UUID_RE);
    expect(decoded).not.toHaveProperty('email');
    // REFRESH_TOKEN_EXPIRATION=7d from setup-env
    expect((decoded.exp as number) - Number(decoded.iat)).toBe(ms('7d') / 1000);
    expect(payload.jti).toBe(decoded.jti);
  });

  it('derives expirations from env at service construction', () => {
    process.env.ACCESS_TOKEN_EXPIRATION = '2m';
    process.env.REFRESH_TOKEN_EXPIRATION = '3d';
    const customService = buildService();

    const access = customService.sign(
      { email: user.email, sub: user.id, sid: randomUUID() },
      TOKEN_TYPE.ACCESS,
    );
    const refresh = customService.sign({ sub: user.id, sid: randomUUID() }, TOKEN_TYPE.REFRESH);

    const decodedAccess = jwtService.verify<TJWTPayload>(access.token);
    const decodedRefresh = jwtService.verify<TJWTPayload>(refresh.token);
    expect((decodedAccess.exp as number) - Number(decodedAccess.iat)).toBe(120);
    expect((decodedRefresh.exp as number) - Number(decodedRefresh.iat)).toBe(3 * 24 * 3600);
  });

  it('signs with JWT_SECRET and issues a fresh jti per token', () => {
    const a = signAccess();
    const b = signAccess();
    expect(a.payload.jti).not.toBe(b.payload.jti);

    // A different secret must not verify the token
    expect(() => new JwtService({ secret: 'wrong-secret' }).verify(a.token)).toThrow();
  });

  it('decode() returns the token payload without verification', () => {
    const { token, payload } = signAccess();
    const decoded = service.decode(token);
    expect(decoded.sub).toBe(user.id);
    expect(decoded.jti).toBe(payload.jti);
    expect(decoded.email).toBe(user.email);
  });

  describe('validate path (JwtAuthStrategy)', () => {
    it('accepts a valid token, attaches the jwt payload to the request and returns the user', async () => {
      const { payload } = signAccess();
      const req: any = {};

      const validated = await strategy.validate(req, payload);

      expect(validated).toMatchObject({
        id: user.id,
        email: user.email,
        role: Roles.USER,
      });
      // Only safe fields are selected — no password hash
      expect((validated as any).pass).toBeUndefined();
      expect(req.jwt).toBe(payload);
    });

    it('rejects a revoked token by jti', async () => {
      const { payload } = signAccess();
      await service.revokeToken({
        jti: payload.jti!,
        sid: null,
        expiresAt: new Date((payload.exp as number) * 1000),
        tokenType: TOKEN_TYPE.ACCESS,
      });

      await expect(strategy.validate({} as any, payload)).rejects.toThrow(
        new UnauthorizedException('Token has been revoked'),
      );
    });

    it('rejects sibling tokens of a revoked session (sid family)', async () => {
      const sid = randomUUID();
      const revoked = signAccess(sid);
      const sibling = signAccess(sid);

      await service.revokeToken({
        jti: revoked.payload.jti!,
        sid,
        expiresAt: new Date((revoked.payload.exp as number) * 1000),
        tokenType: TOKEN_TYPE.ACCESS,
      });

      await expect(strategy.validate({} as any, sibling.payload)).rejects.toThrow(
        'Token has been revoked',
      );
    });

    it('rejects tokens for unknown users', async () => {
      const payload: TJWTPayload = {
        email: 'ghost@test.test',
        sub: randomUUID(),
        jti: randomUUID(),
        sid: randomUUID(),
      };

      await expect(strategy.validate({} as any, payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
