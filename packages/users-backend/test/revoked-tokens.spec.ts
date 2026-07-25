import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import ms from 'ms';
import { RevokedToken, TOKEN_TYPE } from '../src/revoked-tokens/entities/revoked-token.entity';
import { RevokedTokensService } from '../src/revoked-tokens/revoked-tokens.service';
import { createTestDataSource } from './pg';

describe('RevokedTokensService (Postgres)', () => {
  let ds: DataSource;
  let repo: Repository<RevokedToken>;
  let service: RevokedTokensService;

  const future = () => new Date(Date.now() + 60_000);

  beforeAll(async () => {
    ds = await createTestDataSource([RevokedToken]);
    repo = ds.getRepository(RevokedToken);
    service = new RevokedTokensService(repo);
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  it('revokes a token without sid by storing a single jti row', async () => {
    const jti = randomUUID();
    await service.revokeToken(
      { jti, sid: null, expiresAt: future(), tokenType: TOKEN_TYPE.ACCESS },
      '7d',
    );

    const rows = await repo.find({ where: { jti } });
    expect(rows).toHaveLength(1);
    expect(rows[0].sid).toBeNull();
    expect(rows[0].tokenType).toBe(TOKEN_TYPE.ACCESS);

    await expect(service.isTokenRevoked(jti)).resolves.toBe(true);
  });

  it('revoking a token with sid also revokes the whole session family', async () => {
    const jti = randomUUID();
    const sid = randomUUID();
    const before = Date.now();
    await service.revokeToken(
      { jti, sid, expiresAt: future(), tokenType: TOKEN_TYPE.ACCESS },
      '7d',
    );

    // The token row itself
    await expect(service.isTokenRevoked(jti)).resolves.toBe(true);

    // A session family row is stored with jti = sid, type SESSION, expiring
    // after the refresh token lifetime passed to revokeToken.
    const sessionRow = await repo.findOneByOrFail({
      jti: sid,
      tokenType: TOKEN_TYPE.SESSION,
    });
    expect(sessionRow.sid).toBe(sid);
    const expectedExpiry = before + ms('7d');
    expect(sessionRow.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry - 1000);
    expect(sessionRow.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 60_000);

    // Any other token of the same session is now considered revoked...
    const siblingJti = randomUUID();
    await expect(service.isTokenRevoked(siblingJti, sid)).resolves.toBe(true);
    // ...but only when checked with the sid.
    await expect(service.isTokenRevoked(siblingJti)).resolves.toBe(false);
  });

  it('reports untouched tokens as not revoked', async () => {
    await expect(service.isTokenRevoked(randomUUID())).resolves.toBe(false);
    await expect(service.isTokenRevoked(randomUUID(), randomUUID())).resolves.toBe(false);
  });

  it('revoking the same jti twice is idempotent (insert or-ignore)', async () => {
    const jti = randomUUID();
    const token = {
      jti,
      sid: null,
      expiresAt: future(),
      tokenType: TOKEN_TYPE.ACCESS,
    };

    await service.revokeToken(token, '7d');
    await expect(service.revokeToken(token, '7d')).resolves.toBeUndefined();

    await expect(repo.count({ where: { jti } })).resolves.toBe(1);
  });

  it('revokeRefreshToken stores only the token itself, not the session family', async () => {
    const jti = randomUUID();
    const sid = randomUUID();
    await service.revokeRefreshToken({
      jti,
      sid,
      expiresAt: future(),
      tokenType: TOKEN_TYPE.REFRESH,
    });

    await expect(service.isTokenRevoked(jti)).resolves.toBe(true);
    // The stored row has the sid but is not a SESSION row, so the rest of the
    // family stays valid.
    await expect(service.isTokenRevoked(randomUUID(), sid)).resolves.toBe(false);
  });

  it('cleanupExpiredTokens deletes only expired rows', async () => {
    const expiredJti = randomUUID();
    const liveJti = randomUUID();
    await repo.save([
      {
        jti: expiredJti,
        sid: null,
        expiresAt: new Date(Date.now() - 60_000),
        tokenType: TOKEN_TYPE.ACCESS,
      },
      {
        jti: liveJti,
        sid: null,
        expiresAt: new Date(Date.now() + 60 * 60_000),
        tokenType: TOKEN_TYPE.ACCESS,
      },
    ]);

    // The cron handler is private; invoke it directly.
    await (service as any).cleanupExpiredTokens();

    await expect(repo.count({ where: { jti: expiredJti } })).resolves.toBe(0);
    await expect(repo.count({ where: { jti: liveJti } })).resolves.toBe(1);
  });
});
