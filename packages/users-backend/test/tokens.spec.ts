import { randomUUID } from 'node:crypto';
import { Controller, Get, INestApplication, Req } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import request from 'supertest';
import bcrypt from 'bcrypt';
// Import AuthModule through the barrel: the auth/jwt-auth/users modules form
// require cycles that only resolve cleanly when loading starts at the index.
import { AuthModule } from '../src/auth';
import { UsersModule } from '../src/users/users.module';
import { Roles, User } from '../src/users/entities/user.entity';
import { CaslModule } from '../src/casl/casl.module';
import { TokensModule } from '../src/tokens/tokens.module';
import { Token } from '../src/tokens/entities/token.entity';
import { TokensPermissions } from '../src/tokens/tokens.permissions';
import { RevokedToken } from '../src/revoked-tokens/entities/revoked-token.entity';
import { createTestDatabase, testDataSourceOptions } from './pg';

// uuid v13 ships ESM-only code that jest's CommonJS runtime cannot parse;
// JWTAuthService only uses v4, so substitute node's own uuid generator.
jest.mock('uuid', () => ({ v4: () => require('node:crypto').randomUUID() }));

const ADMIN_EMAIL = 'test-admin@test.test';
const ADMIN_PASSWORD = 'test';

describe('Tokens', () => {
  let db: string;
  let app: INestApplication;
  let dataSource: DataSource;
  let tokenRepo: Repository<Token>;
  let userRepo: Repository<User>;

  let adminJwt: string;
  let admin: User;

  // Filled by the creation test, reused by the bearer-auth suite below
  let apiTokenId: string;
  let apiTokenValue: string;

  function login(email: string, password: string) {
    return request(app.getHttpServer()).post('/auth/login').send({ email, password });
  }

  beforeAll(async () => {
    db = await createTestDatabase();
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(testDataSourceOptions(db, [User, Token, RevokedToken])),
        AuthModule.forRoot({
          localAuth: true,
          withControllers: true,
          dataSourceName: 'default',
        }),
        UsersModule.register({
          withControllers: false,
          dataSourceName: 'default',
        }),
        CaslModule.forRoot(),
        TokensModule.forRoot({ dataSourceName: 'default' }),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());
    tokenRepo = dataSource.getRepository(Token);
    userRepo = dataSource.getRepository(User);

    // UsersModule seeds this admin on first boot of an empty database
    admin = await userRepo.findOneByOrFail({ email: ADMIN_EMAIL });
    const loginRes = await login(ADMIN_EMAIL, ADMIN_PASSWORD).expect(201);
    adminJwt = loginRes.body.accessToken.token;
    expect(adminJwt).toEqual(expect.any(String));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TokensController & MyTokensController (TokensModule.forRoot)', () => {
    it('rejects unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/tokens').expect(401);
      await request(app.getHttpServer()).post('/my/tokens').send({ name: 'nope' }).expect(401);
    });

    it('POST /my/tokens returns the secret once and stores only a bcrypt hash', async () => {
      const res = await request(app.getHttpServer())
        .post('/my/tokens')
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({ name: 'ci token' })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'ci token',
        userId: admin.id,
      });
      expect(res.body.value).toMatch(new RegExp(`^${res.body.id}\\.[0-9a-f]{64}$`));
      expect(res.body.hash).toBeUndefined();

      apiTokenId = res.body.id;
      apiTokenValue = res.body.value;
      const rawSecret = apiTokenValue.split('.')[1];

      const row = await tokenRepo.findOneByOrFail({ id: apiTokenId });
      expect(row.userId).toBe(admin.id);
      // The stored hash is a bcrypt hash of the secret, never the plaintext
      expect(row.hash).not.toContain(rawSecret);
      expect(row.hash).toMatch(/^\$2[aby]\$/);
      await expect(bcrypt.compare(rawSecret, row.hash)).resolves.toBe(true);
    });

    it('GET /tokens lists tokens for admin without exposing hashes', async () => {
      await request(app.getHttpServer())
        .post('/my/tokens')
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({ name: 'to-delete' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/tokens')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body).toMatchObject({
        count: 2,
        total: 2,
        page: 1,
      });
      const names = res.body.data.map((t: Token) => t.name).sort();
      expect(names).toEqual(['ci token', 'to-delete']);
      for (const token of res.body.data) {
        expect(token.hash).toBeUndefined();
      }
    });

    it('PATCH /tokens/:id renames a token without touching its hash', async () => {
      const { hash: hashBefore, id } = await tokenRepo.findOneByOrFail({ name: 'to-delete' });

      const res = await request(app.getHttpServer())
        .patch(`/tokens/${id}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({ name: 'renamed' })
        .expect(200);
      expect(res.body.name).toBe('renamed');

      const row = await tokenRepo.findOneByOrFail({ id });
      expect(row.name).toBe('renamed');
      expect(row.hash).toBe(hashBefore);
    });

    it('DELETE /tokens/:id removes the row', async () => {
      const { id } = await tokenRepo.findOneByOrFail({ name: 'renamed' });

      await request(app.getHttpServer())
        .delete(`/tokens/${id}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      await expect(tokenRepo.findOneBy({ id })).resolves.toBeNull();
    });

    describe('MyTokens scoping', () => {
      let user2: User;
      let user2Jwt: string;
      let user2TokenId: string;

      beforeAll(async () => {
        user2 = await userRepo.save({
          name: 'Second User',
          email: 'second-user@test.test',
          role: Roles.USER,
          pass: await bcrypt.hash('second-pass', 4),
          permissions: [TokensPermissions.MANAGE_MY],
        });
        const res = await login('second-user@test.test', 'second-pass').expect(201);
        user2Jwt = res.body.accessToken.token;
      });

      it('a user with my-tokens:manage can create own tokens', async () => {
        const res = await request(app.getHttpServer())
          .post('/my/tokens')
          .set('Authorization', `Bearer ${user2Jwt}`)
          .send({ name: 'user2 token' })
          .expect(201);

        expect(res.body.userId).toBe(user2.id);
        user2TokenId = res.body.id;
      });

      it('GET /my/tokens returns only the current user tokens', async () => {
        const user2Res = await request(app.getHttpServer())
          .get('/my/tokens')
          .set('Authorization', `Bearer ${user2Jwt}`)
          .expect(200);
        expect(user2Res.body.data.map((t: Token) => t.id)).toEqual([user2TokenId]);

        const adminRes = await request(app.getHttpServer())
          .get('/my/tokens')
          .set('Authorization', `Bearer ${adminJwt}`)
          .expect(200);
        expect(adminRes.body.data.map((t: Token) => t.id)).toEqual([apiTokenId]);
      });

      it('cannot delete another user token through /my/tokens', async () => {
        await request(app.getHttpServer())
          .delete(`/my/tokens/${apiTokenId}`)
          .set('Authorization', `Bearer ${user2Jwt}`)
          .expect(404);

        await expect(tokenRepo.findOneBy({ id: apiTokenId })).resolves.not.toBeNull();
      });

      it('admin-only /tokens routes are forbidden for a regular user', async () => {
        await request(app.getHttpServer())
          .get('/tokens')
          .set('Authorization', `Bearer ${user2Jwt}`)
          .expect(403);

        await request(app.getHttpServer())
          .patch(`/tokens/${user2TokenId}`)
          .set('Authorization', `Bearer ${user2Jwt}`)
          .send({ name: 'hacked' })
          .expect(403);
      });
    });
  });

  describe('TokensModule.forRoot + forAuth in one app', () => {
    let combinedApp: INestApplication;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          TypeOrmModule.forRoot(testDataSourceOptions(db, [User, Token, RevokedToken])),
          AuthModule.forRoot({
            localAuth: true,
            withControllers: true,
            dataSourceName: 'default',
          }),
          UsersModule.register({
            withControllers: false,
            dataSourceName: 'default',
          }),
          CaslModule.forRoot(),
          TokensModule.forRoot({ dataSourceName: 'default' }),
          TokensModule.forAuth({ dataSourceName: 'default' }),
        ],
      }).compile();
      combinedApp = moduleRef.createNestApplication();
      await combinedApp.init();
    });

    afterAll(async () => {
      await combinedApp.close();
    });

    it('cannot coexist: forAuth global TokenAuthGuard breaks even the login route', async () => {
      // forAuth registers TokenAuthGuard as a global APP_GUARD with no skip
      // mechanism, so any request without a valid API bearer token — including
      // POST /auth/login with correct credentials — is rejected. That is why the
      // bearer-strategy suite below runs forAuth in a separate app.
      await request(combinedApp.getHttpServer())
        .post('/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(401);
    });
  });

  describe('bearer strategy (TokensModule.forAuth, separate app on the same database)', () => {
    let authApp: INestApplication;

    @Controller()
    class WhoAmIController {
      @Get('whoami')
      whoami(@Req() req: any) {
        return req.user;
      }
    }

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          TypeOrmModule.forRoot(testDataSourceOptions(db, [User, Token])),
          TokensModule.forAuth({ dataSourceName: 'default' }),
        ],
        controllers: [WhoAmIController],
      }).compile();
      authApp = moduleRef.createNestApplication();
      await authApp.init();
    });

    afterAll(async () => {
      await authApp.close();
    });

    it('authenticates a request bearing an API token created via /my/tokens', async () => {
      const res = await request(authApp.getHttpServer())
        .get('/whoami')
        .set('Authorization', `Bearer ${apiTokenValue}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: admin.id,
        email: ADMIN_EMAIL,
        role: Roles.ADMIN,
        tokenId: apiTokenId,
      });
      // The password hash is stripped from the resolved user
      expect(res.body.pass).toBeUndefined();
    });

    it('rejects a malformed token', async () => {
      await request(authApp.getHttpServer())
        .get('/whoami')
        .set('Authorization', 'Bearer bogus-token')
        .expect(401);
    });

    it('rejects a token with a valid id but wrong secret', async () => {
      await request(authApp.getHttpServer())
        .get('/whoami')
        .set('Authorization', `Bearer ${apiTokenId}.${'0'.repeat(64)}`)
        .expect(401);
    });

    it('rejects a well-formed token that does not exist', async () => {
      await request(authApp.getHttpServer())
        .get('/whoami')
        .set('Authorization', `Bearer ${randomUUID()}.${'a'.repeat(64)}`)
        .expect(401);
    });

    it('rejects requests without an Authorization header', async () => {
      await request(authApp.getHttpServer()).get('/whoami').expect(401);
    });
  });
});
