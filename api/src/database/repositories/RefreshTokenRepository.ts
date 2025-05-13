import BaseRepository from './BaseRepository'
import RefreshToken from '../models/Refresh-token'
import { importSPKI, jwtVerify } from 'jose'
import { config } from '@app/config'
import { Knex } from 'knex'
import { logger } from '@app/utils/logger'

class TokenRefreshRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshToken)
  }

  async saveRefreshToken(
    userId: string,
    tokenId: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return RefreshToken.query().insert({
      userId,
      tokenId,
      expiresAt,
      revoked: false,
      createdAt: new Date(),
    })
  }

  async validateRefreshTokenInDb(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      // Extract the jti from the token
      const result = await jwtVerify(
        refreshToken,
        await importSPKI(config.secret.publicKey, 'ES256')
      )
      const { payload } = result
      const tokenId = payload.jti

      if (!tokenId) {
        logger.warn('Refresh token missing jti claim', { userId })
        return false
      }

      // Find the token in the database
      const token = await RefreshToken.query()
        .where({
          userId,
          tokenId,
          revoked: false,
        })
        .where('expiresAt', '>', new Date())
        .first()

      return !!token
    } catch (error) {
      logger.error('Failed to validate refresh token:', error)
      return false
    }
  }

  async findRefreshTokenByTokenId(
    tokenId: string
  ): Promise<RefreshToken | undefined> {
    return RefreshToken.query().findOne({ tokenId })
  }

  async revokeRefreshToken(userId: string, tokenId: string): Promise<boolean> {
    try {
      const affectedRows = await RefreshToken.query()
        .where({ userId, tokenId })
        .patch({ revoked: true, revokedAt: new Date() })

      return affectedRows > 0
    } catch (error) {
      logger.error('Failed to revoke refresh token:', error)
      throw new Error('Failed to revoke refresh token')
    }
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<number> {
    try {
      return await RefreshToken.query()
        .where({ userId, revoked: false })
        .patch({ revoked: true, revokedAt: new Date() })
    } catch (error) {
      logger.error('Failed to revoke all user refresh tokens:', error)
      throw new Error('Failed to revoke all user refresh tokens')
    }
  }

  async rotateRefreshToken(
    userId: string,
    oldTokenId: string,
    newTokenId: string,
    expiresAt: Date
  ): Promise<void> {
    // Using the transaction helper
    await this.transaction(async (trx) => {
      // Revoke old token
      await this.update(
        oldTokenId,
        { revoked: true, revokedAt: new Date() } as Partial<RefreshToken>,
        trx
      )

      // Create new token
      await this.create(
        {
          userId,
          tokenId: newTokenId,
          expiresAt,
          revoked: false,
          createdAt: new Date(),
        } as Partial<RefreshToken>,
        trx
      )
    })
  }

  async cleanupExpiredTokens(): Promise<number> {
    try {
      return await RefreshToken.query()
        .where('expiresAt', '<', new Date())
        .delete()
    } catch (error) {
      logger.error('Failed to clean up expired tokens:', error)
      throw new Error('Failed to clean up expired tokens')
    }
  }

  // Delete tokens older than the specified days, even if not expired
  async purgeOldTokens(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      return await RefreshToken.query()
        .where('createdAt', '<', cutoffDate)
        .delete()
    } catch (error) {
      logger.error('Failed to purge old tokens:', error)
      throw new Error('Failed to purge old tokens')
    }
  }

  // For security auditing
  async getUserRefreshTokens(userId: string): Promise<RefreshToken[]> {
    return RefreshToken.query().where({ userId }).orderBy('createdAt', 'desc')
  }

  // Check for potential token reuse (security feature)
  async checkForTokenReuse(
    userId: string,
    tokenId: string
  ): Promise<{ reused: boolean; revokedAt?: Date }> {
    try {
      const token = await RefreshToken.query()
        .where({ userId, tokenId, revoked: true })
        .first()

      if (token && token.revokedAt) {
        // Token exists, is revoked, and has a revocation timestamp
        return { reused: true, revokedAt: token.revokedAt }
      }

      return { reused: false }
    } catch (error) {
      logger.error('Failed to check for token reuse:', error)
      throw new Error('Failed to check for token reuse')
    }
  }
}

export const tokenRefreshRepository = new TokenRefreshRepository()
