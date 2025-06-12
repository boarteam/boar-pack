import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RevokedToken } from './entities/revoked-token.entity';
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class RevokedTokensService {
  private readonly logger = new Logger(RevokedTokensService.name);

  constructor(private revokedTokenRepository: Repository<RevokedToken>) {}

  /**
   * Revokes a JWT token by storing its JTI in the database
   * @param jti The JWT token identifier
   * @param expiresAt When the token naturally expires
   */
  async revokeToken(jti: string, expiresAt: Date): Promise<void> {
    await this.revokedTokenRepository
      .createQueryBuilder()
      .insert()
      .into(RevokedToken)
      .values({ jti, expiresAt })
      .orIgnore()
      .execute();

    this.logger.debug(`Token with JTI ${jti} has been revoked`);
  }

  /**
   * Checks if a token has been revoked
   * @param jti The JWT token identifier
   * @returns true if the token is revoked, false otherwise
   */
  async isTokenRevoked(jti: string): Promise<boolean> {
    const token = await this.revokedTokenRepository.findOne({
      where: { jti },
    });
    return !!token;
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
