import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RevokedToken, TOKEN_TYPE, TRevokedToken } from './entities/revoked-token.entity';
import { Cron, CronExpression } from "@nestjs/schedule";
import ms, { StringValue } from "ms";

@Injectable()
export class RevokedTokensService {
  private readonly logger = new Logger(RevokedTokensService.name);

  constructor(private revokedTokenRepository: Repository<RevokedToken>) {}

  /**
   * Revokes a JWT token by storing its JTI in the database
   * @param token The token to revoke, containing at least the JTI and expiration date
   * @param refreshTokenExpiration The expiration time for the refresh token. We use it to set the expiration date of
   * the session token.
   */
  async revokeToken(token: TRevokedToken, refreshTokenExpiration: StringValue): Promise<void> {
    const tokens: TRevokedToken[] = [token];

    if (token.sid) {
      tokens.push({
        jti: token.sid,
        sid: token.sid,
        expiresAt: new Date(Date.now() + ms(refreshTokenExpiration)),
        tokenType: TOKEN_TYPE.SESSION,
      });
    }

    await this.revokedTokenRepository
      .createQueryBuilder()
      .insert()
      .into(RevokedToken)
      .values(tokens)
      .orIgnore()
      .execute();

    this.logger.debug(`Token with JTI ${token.jti} has been revoked`);
  }

  /**
   * Checks if a token has been revoked
   * @param jti The JWT token identifier
   * @param sid Optional session identifier, used for session tokens
   * @returns true if the token is revoked, false otherwise
   */
  async isTokenRevoked(jti: string, sid?: string): Promise<boolean> {
    const tokensCount = await this.revokedTokenRepository.count({
      where: [
        { jti },
        { sid, tokenType: TOKEN_TYPE.SESSION },
      ]
    });
    return tokensCount > 0;
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async cleanupExpiredTokens() {
    const now = new Date();
    this.logger.debug('Starting cleanup of expired revoked tokens');

    try {
      const result = await this.revokedTokenRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now })
        .execute();

      this.logger.log(`Cleaned up ${result.affected || 0} expired revoked tokens`);
    } catch (error) {
      this.logger.error(`Error during revoked tokens cleanup: ${error.message}`, error.stack);
    }
  }
}
