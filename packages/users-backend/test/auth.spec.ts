import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
// The auth barrel must be loaded before any deep src import: the package has a
// circular import chain (auth.service -> jwt-auth index -> jwt-auth strategy ->
// auth index) that only resolves cleanly when entered through './auth', which
// is exactly how src/index.ts (the production entrypoint) loads it.
import '../src/auth';
import { AuthModule } from '../src/auth/auth.module';
import { CaslModule } from '../src/casl/casl.module';
import { SkipPoliciesGuard } from '../src/casl/policies.guard';
import { SkipJWTGuard } from '../src/jwt-auth/jwt-auth.guard';
import { Roles, User } from '../src/users/entities/user.entity';
import { UsersModule } from '../src/users/users.module';
import { Token } from '../src/tokens/entities/token.entity';
import { RevokedToken, TOKEN_TYPE } from '../src/revoked-tokens/entities/revoked-token.entity';
import { EventLog } from '../src/event-logs/entities/event-log.entity';
import { Setting } from '../src/settings/entities/setting.entity';
import { AuditLog } from '../src/audit-logs/entities/audit-log.entity';
import { createTestDatabase, testDataSourceOptions } from './pg';
import { ADMIN_EMAIL, findSetCookie, login, setCookieValue } from './auth-helpers';

// uuid v13 is ESM-only and cannot be parsed by the CJS jest runtime, so the
// import inside JWTAuthService is replaced with the equivalent node builtin
// (same v4 semantics).
jest.mock('uuid', () => ({
  v4: () => require('node:crypto').randomUUID(),
}));

const dataSourceName = 'boar_pack_db';

@Controller('policy-probe')
class PolicyProbeController {
  // No @CheckPolicies here on purpose — PoliciesGuard must deny it.
  @Get('closed')
  closed() {
    return { ok: true };
  }

  @SkipPoliciesGuard()
  @SkipJWTGuard()
  @Get('open')
  open() {
    return { ok: true };
  }
}

describe('auth (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const database = await createTestDatabase();
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true }),
        TypeOrmModule.forRoot({
          ...testDataSourceOptions(database, [
            User,
            Token,
            RevokedToken,
            EventLog,
            Setting,
            AuditLog,
          ]),
          name: dataSourceName,
        }),
        CaslModule.forRoot(),
        AuthModule.forRoot({
          localAuth: true,
          withControllers: true,
          dataSourceName,
        }),
        UsersModule.register({
          withControllers: true,
          dataSourceName,
        }),
      ],
      controllers: [PolicyProbeController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    dataSource = app.get(getDataSourceToken(dataSourceName));
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('admin seeding', () => {
    it('creates exactly one default admin with a hashed password', async () => {
      const users = await dataSource.getRepository(User).find();

      expect(users).toHaveLength(1);
      const admin = users[0];
      expect(admin.email).toBe(ADMIN_EMAIL);
      expect(admin.role).toBe(Roles.ADMIN);
      expect(admin.pass).not.toBe('test');
      // bcrypt hash with the configured cost factor (BCRYPT_SALT_ROUNDS=4)
      expect(admin.pass).toMatch(/^\$2[aby]\$04\$/);
    });
  });

  describe('POST /auth/login', () => {
    // Nest defaults POST routes to 201; login/refresh/logout do not override it.
    it('returns a token pair and sets auth cookies', async () => {
      const res = await login(server).expect(201);

      const { accessToken, refreshToken } = res.body;
      expect(accessToken.token.split('.')).toHaveLength(3);
      expect(accessToken.payload).toMatchObject({
        email: ADMIN_EMAIL,
        sub: expect.any(String),
        sid: expect.any(String),
        jti: expect.any(String),
        exp: expect.any(Number),
      });
      expect(refreshToken.token.split('.')).toHaveLength(3);
      expect(refreshToken.payload).toMatchObject({
        sub: accessToken.payload.sub,
        sid: accessToken.payload.sid, // same session
        jti: expect.any(String),
        exp: expect.any(Number),
      });
      expect(refreshToken.payload.jti).not.toBe(accessToken.payload.jti);

      // ACCESS_TOKEN_EXPIRATION=1h, REFRESH_TOKEN_EXPIRATION=7d
      const accessTtlMs = accessToken.payload.exp * 1000 - Date.now();
      expect(accessTtlMs).toBeGreaterThan(3590 * 1000);
      expect(accessTtlMs).toBeLessThanOrEqual(3600 * 1000);
      const refreshTtlMs = refreshToken.payload.exp * 1000 - Date.now();
      expect(refreshTtlMs).toBeGreaterThan(604790 * 1000);
      expect(refreshTtlMs).toBeLessThanOrEqual(604800 * 1000);

      const accessCookie = findSetCookie(res, 'auth_token');
      expect(accessCookie).toBeDefined();
      expect(accessCookie).toContain('HttpOnly');
      expect(accessCookie).toContain('SameSite=Lax');
      expect(accessCookie).not.toContain('Secure'); // SECURE_COOKIE=false
      expect(setCookieValue(res, 'auth_token')).toBe(accessToken.token);

      const refreshCookie = findSetCookie(res, 'auth_refresh_token');
      expect(refreshCookie).toBeDefined();
      // scoped to the REFRESH_TOKEN_PATH default
      expect(refreshCookie).toContain('Path=/api/auth/refresh');
      expect(refreshCookie).toContain('HttpOnly');
      expect(setCookieValue(res, 'auth_refresh_token')).toBe(refreshToken.token);
    });

    it('rejects a wrong password with 401', async () => {
      await login(server, ADMIN_EMAIL, 'wrong-password').expect(401);
    });

    it('rejects an unknown email with 401', async () => {
      await login(server, 'nobody@test.test', 'test').expect(401);
    });

    it('accepts a differently-cased email (the strategy lowercases it)', async () => {
      const res = await login(server, 'TEST-ADMIN@TEST.TEST').expect(201);
      expect(res.body.accessToken.payload.email).toBe(ADMIN_EMAIL);
    });
  });

  describe('GET /me', () => {
    it('returns the user with packed admin abilities for a bearer token', async () => {
      const loginRes = await login(server).expect(201);

      const res = await request(server)
        .get('/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken.token}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: loginRes.body.accessToken.payload.sub,
        name: 'Admin',
        email: ADMIN_EMAIL,
        role: Roles.ADMIN,
      });
      expect(res.body.pass).toBeUndefined();
      // admin role packs into a single `manage all` CASL rule
      expect(res.body.policies).toEqual([['manage', 'all']]);
    });

    it('accepts the auth_token cookie transport', async () => {
      const loginRes = await login(server).expect(201);

      await request(server)
        .get('/me')
        .set('Cookie', `auth_token=${loginRes.body.accessToken.token}`)
        .expect(200);
    });

    it('rejects requests without a token', async () => {
      await request(server).get('/me').expect(401);
    });

    it('rejects a garbage token', async () => {
      await request(server).get('/me').set('Authorization', 'Bearer not.a.jwt').expect(401);
    });

    it('currently accepts a refresh token as an access token', async () => {
      // BUG: access and refresh JWTs share the secret and carry no type
      // discriminator, so the access-token strategy accepts refresh tokens
      // (payload.sub is enough for the user lookup). Asserting the current
      // behavior here.
      const loginRes = await login(server).expect(201);

      await request(server)
        .get('/me')
        .set('Authorization', `Bearer ${loginRes.body.refreshToken.token}`)
        .expect(200);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates the pair for a refresh token in the Authorization header; the old token is single-use', async () => {
      const loginRes = await login(server).expect(201);
      const oldRefresh = loginRes.body.refreshToken;

      const refreshRes = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${oldRefresh.token}`)
        .expect(201);

      // the new pair is delivered via cookies only, the body is empty
      expect(refreshRes.body).toEqual({});
      const newAccess = setCookieValue(refreshRes, 'auth_token');
      const newRefresh = setCookieValue(refreshRes, 'auth_refresh_token');
      expect(newAccess).toBeDefined();
      expect(newRefresh).toBeDefined();
      expect(newAccess).not.toBe(loginRes.body.accessToken.token);
      expect(newRefresh).not.toBe(oldRefresh.token);

      // the new access token works
      await request(server).get('/me').set('Authorization', `Bearer ${newAccess}`).expect(200);

      // the used refresh token was revoked on use…
      const revoked = await dataSource
        .getRepository(RevokedToken)
        .findOneBy({ jti: oldRefresh.payload.jti });
      expect(revoked?.tokenType).toBe(TOKEN_TYPE.REFRESH);

      // …so replaying it fails…
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${oldRefresh.token}`)
        .expect(401);

      // …while the new refresh token performs the next rotation
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${newRefresh}`)
        .expect(201);
    });

    it('accepts the auth_refresh_token cookie transport, still single-use', async () => {
      const loginRes = await login(server).expect(201);
      const oldToken = loginRes.body.refreshToken.token;

      const res = await request(server)
        .post('/auth/refresh')
        .set('Cookie', `auth_refresh_token=${oldToken}`)
        .expect(201);

      expect(setCookieValue(res, 'auth_token')).toBeDefined();
      expect(setCookieValue(res, 'auth_refresh_token')).toBeDefined();

      await request(server)
        .post('/auth/refresh')
        .set('Cookie', `auth_refresh_token=${oldToken}`)
        .expect(401);
    });

    it('rejects requests without any refresh token', async () => {
      await request(server).post('/auth/refresh').expect(401);
    });

    it('rejects a garbage refresh token', async () => {
      await request(server)
        .post('/auth/refresh')
        .set('Cookie', 'auth_refresh_token=not.a.jwt')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('clears cookies and revokes the whole session', async () => {
      const loginRes = await login(server).expect(201);
      const access = loginRes.body.accessToken;
      const refresh = loginRes.body.refreshToken;

      const logoutRes = await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access.token}`)
        .expect(201);

      const clearedAccess = findSetCookie(logoutRes, 'auth_token');
      expect(clearedAccess).toContain('auth_token=;');
      expect(clearedAccess).toContain('Expires=Thu, 01 Jan 1970');
      const clearedRefresh = findSetCookie(logoutRes, 'auth_refresh_token');
      expect(clearedRefresh).toContain('auth_refresh_token=;');
      expect(clearedRefresh).toContain('Path=/api/auth/refresh');
      expect(clearedRefresh).toContain('Expires=Thu, 01 Jan 1970');

      // logout revokes the access token JTI plus a session-wide entry keyed by SID
      const revokedRepo = dataSource.getRepository(RevokedToken);
      const accessRow = await revokedRepo.findOneBy({
        jti: access.payload.jti,
      });
      expect(accessRow?.tokenType).toBe(TOKEN_TYPE.ACCESS);
      expect(accessRow?.sid).toBe(access.payload.sid);
      const sessionRow = await revokedRepo.findOneBy({
        jti: access.payload.sid,
      });
      expect(sessionRow?.tokenType).toBe(TOKEN_TYPE.SESSION);

      // so the access token stops working…
      await request(server).get('/me').set('Authorization', `Bearer ${access.token}`).expect(401);

      // …and so does the refresh token of the same session
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refresh.token}`)
        .expect(401);
    });

    it('requires an access token', async () => {
      await request(server).post('/auth/logout').expect(401);
    });
  });

  describe('PoliciesGuard', () => {
    it('closes routes without @CheckPolicies by default, even when authenticated', async () => {
      const loginRes = await login(server).expect(201);

      await request(server)
        .get('/policy-probe/closed')
        .set('Authorization', `Bearer ${loginRes.body.accessToken.token}`)
        .expect(403);
    });

    it('lets @SkipPoliciesGuard + @SkipJWTGuard routes through unauthenticated', async () => {
      const res = await request(server).get('/policy-probe/open').expect(200);
      expect(res.body).toEqual({ ok: true });
    });
  });
});
