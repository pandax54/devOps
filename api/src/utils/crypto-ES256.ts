// src/utils/crypto-ES256.ts
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose'
import { config } from '@app/config'
import { userRepository } from '@app/database/repositories/userRepository'
import { tokenRefreshRepository } from '@app/database/repositories/RefreshTokenRepository'
import { logger } from '@app/utils/logger'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Load keys from environment variables or files
const getPrivateKey = (): string => {
  // Try to load from environment variable first
  if (config.secret?.privateKey) {
    return config.secret.privateKey.replace(/\\n/g, '\n')
  }

  try {
    const privateKeyPath = path.join(__dirname, '../../keys/private-key.pem')
    console.log('privateKeyPath:', privateKeyPath)
    return fs.readFileSync(privateKeyPath, 'utf8')
  } catch (error) {
    logger.error('Failed to load private key:', error)
    throw new Error('JWT private key not configured')
  }
}

const getPublicKey = (): string => {
  // Try to load from environment variable first
  if (config.secret?.publicKey) {
    return config.secret.publicKey.replace(/\\n/g, '\n')
  }

  // Fall back to file
  try {
    const publicKeyPath = path.join(__dirname, '../../keys/public-key.pem')
    return fs.readFileSync(publicKeyPath, 'utf8')
  } catch (error) {
    logger.error('Failed to load public key:', error)
    throw new Error('JWT public key not configured')
  }
}

const getRefreshPrivateKey = (): string => {
  // Try to load from environment variable first
  if (process.env.REFRESH_PRIVATE_KEY) {
    return process.env.REFRESH_PRIVATE_KEY.replace(/\\n/g, '\n')
  }

  // Fall back to file (you might want separate files for refresh tokens)
  try {
    const privateKeyPath = path.join(
      __dirname,
      '../../keys/refresh-private-key.pem'
    )
    return fs.readFileSync(privateKeyPath, 'utf8')
  } catch (error) {
    // If refresh key doesn't exist, fall back to regular private key
    logger.warn('No specific refresh private key found, using access token key')
    return getPrivateKey()
  }
}

const getRefreshPublicKey = (): string => {
  // Try to load from environment variable first
  if (process.env.REFRESH_PUBLIC_KEY) {
    return process.env.REFRESH_PUBLIC_KEY.replace(/\\n/g, '\n')
  }

  // Fall back to file
  try {
    const publicKeyPath = path.join(
      __dirname,
      '../../keys/refresh-public-key.pem'
    )
    return fs.readFileSync(publicKeyPath, 'utf8')
  } catch (error) {
    // If refresh key doesn't exist, fall back to regular public key
    logger.warn('No specific refresh public key found, using access token key')
    return getPublicKey()
  }
}

export const getBearerToken = (authorization?: string): string | null => {
  if (!authorization) {
    return null
  }

  const parts = authorization.split(' ')
  if (parts.length !== 2) {
    return null
  }

  const scheme = parts[0]
  const hash = parts[1]

  if (scheme !== 'Bearer') {
    return null
  }

  return hash
}

export const createToken = async (payload: {
  userId: string
  role: string
  email: string
}): Promise<string> => {
  try {
    
    // console.log('Private key:', config.secret.privateKey)
    // const privateKeyPem = config.secret.privateKey.replace(/\\n/g, '\n')
    // upload the key from file in keys folder
    const privateKeyPem = getPrivateKey()
    const privateKey = await importPKCS8(privateKeyPem, 'ES256')

    // Check if the key has the proper PEM format
    const hasProperFormat =
      privateKeyPem.startsWith('-----BEGIN PRIVATE KEY-----') &&
      privateKeyPem.endsWith('-----END PRIVATE KEY-----')
    console.log('Has proper PEM format:', hasProperFormat)
    console.log('Private key imported successfully')
    // =======

    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setExpirationTime(config.secret.expirationTime || '1h')
      .setJti(crypto.randomUUID()) // Unique identifier for the token
      .sign(privateKey)
  } catch (error) {
    logger.error('Error creating access token:', error)
    throw new Error(`Failed to create access token: ${error.message}`)
  }
}

export const createRefreshToken = async (userId: string): Promise<string> => {
  try {
    // const privateKeyPem = config.secret.privateKey.replace(/\\n/g, '\n')
    const privateKeyPem = getPrivateKey()
    const privateKey = await importPKCS8(privateKeyPem, 'ES256')

    // Create a tokenId (jti)
    const tokenId = crypto.randomUUID()

    // Calculate expiration
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION_TIME || '7d'
    const expiresInMs = expiresIn.endsWith('d')
      ? parseInt(expiresIn.replace('d', '')) * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000 // Default to 7 days

    const expiresAt = new Date(Date.now() + expiresInMs)

    // Create token with JTI claim
    const refreshToken = await new SignJWT({
      userId,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setJti(tokenId) // Store this in the database
      .sign(privateKey)

    // Save to database
    await tokenRefreshRepository.saveRefreshToken(userId, tokenId, expiresAt)

    return refreshToken
  } catch (error) {
    logger.error('Error creating refresh token:', error)
    throw new Error(`Failed to create refresh token: ${error.message}`)
  }
}

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Verify the refresh token
    const publicKeyPem = config.secret.publicKey.replace(/\\n/g, '\n')
    const publicKey = await importSPKI(publicKeyPem, 'ES256')

    const { payload } = await jwtVerify(refreshToken, publicKey)

    if (!payload.userId || !payload.jti || payload.type !== 'refresh') {
      throw new Error('Invalid refresh token format')
    }

    const userId = payload.userId as string
    const tokenId = payload.jti as string

    // Check if refresh token is valid in database
    const isValid = await tokenRefreshRepository.validateRefreshTokenInDb(
      userId,
      refreshToken
    )

    if (!isValid) {
      // Check if token was revoked after being used (potential token theft)
      const tokenReuse = await tokenRefreshRepository.checkForTokenReuse(
        userId,
        tokenId
      )

      if (tokenReuse.reused) {
        logger.warn('Possible refresh token reuse detected', {
          userId,
          tokenId,
          revokedAt: tokenReuse.revokedAt,
        })

        // Revoke all tokens for this user as a security measure
        await tokenRefreshRepository.revokeAllUserRefreshTokens(userId)
        throw new Error('Security alert: All sessions have been terminated')
      }

      throw new Error('Invalid or expired refresh token')
    }

    // Get user data for the new access token
    const user = await userRepository.getUserById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Create a new access token
    const accessToken = await createToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })

    // Generate a new refresh token (token rotation for better security)
    const newTokenId = crypto.randomUUID()
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION_TIME || '7d'
    const expiresInMs = expiresIn.endsWith('d')
      ? parseInt(expiresIn) * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + expiresInMs)

    // Get the private key for signing the new refresh token
    const privateKeyPem = config.secret.privateKey.replace(/\\n/g, '\n')
    const privateKey = await importPKCS8(privateKeyPem, 'ES256')

    // Create new refresh token
    const newRefreshToken = await new SignJWT({
      userId,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setJti(newTokenId)
      // .sign(await importPKCS8(privateKeyPem, 'ES256'))
      .sign(privateKey)

    // Update the database (revoke old, add new)
    await tokenRefreshRepository.rotateRefreshToken(
      userId,
      tokenId,
      newTokenId,
      expiresAt
    )

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  } catch (error) {
    logger.error('Failed to refresh token:', error)
    throw new Error(`Failed to refresh token: ${error.message}`)
  }
}

export const revokeRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  try {
    // Extract the JTI from the token
    const { payload } = await jwtVerify(
      refreshToken,
      await importSPKI(config.secret.publicKey.replace(/\\n/g, '\n'), 'ES256')
    )

    if (!payload.jti) {
      throw new Error('Invalid token format')
    }

    // Revoke the token in the database
    return tokenRefreshRepository.revokeRefreshToken(
      userId,
      payload.jti as string
    )
  } catch (error) {
    logger.error('Failed to revoke token:', error)
    throw new Error(`Failed to revoke token: ${error.message}`)
  }
}

export const logoutFromAllDevices = async (userId: string) => {
  try {
    await tokenRefreshRepository.revokeAllUserRefreshTokens(userId)
    return { success: true, message: 'Logged out from all devices' }
  } catch (error) {
    logger.error('Failed to logout from all devices:', error)
    throw new Error(`Failed to logout from all devices: ${error.message}`)
  }
}
