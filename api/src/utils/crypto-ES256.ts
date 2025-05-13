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

  // Fall back to file
  try {
    const privateKeyPath = path.join(__dirname, '../../keys/private-key.pem')
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

// === ACCESS TOKEN ===

// export const createToken = async (payload: {
//   userId: string;
//   role: string;
//   email: string;
// }): Promise<string> => {
//   try {
//     // For ES256, use a private key for signing
//     const privateKeyPem = getPrivateKey();
//     const privateKey = await importPKCS8(privateKeyPem, 'ES256');

//     return new SignJWT(payload)
//       .setProtectedHeader({ alg: 'ES256' })
//       .setIssuedAt()
//       .setExpirationTime(config.secret.expirationTime || '1h')
//       .setJti(crypto.randomUUID()) // Unique identifier for the token
//       .sign(privateKey);
//   } catch (error) {
//     logger.error('Error creating access token:', error);
//     throw new Error(`Failed to create access token: ${error.message}`);
//   }
// };

// export const verifyToken = async (token: string) => {
//   try {
//     // For ES256, use a public key for verification
//     const publicKeyPem = getPublicKey();
//     const publicKey = await importSPKI(publicKeyPem, 'ES256');

//     const { payload } = await jwtVerify(token, publicKey, {
//       maxTokenAge: config.secret.maxTokenAge || '2h', // Add some leeway over the expiration
//     });
//     return payload;
//   } catch (error) {
//     if (error.code === 'ERR_JWT_EXPIRED') {
//       throw new Error('Token has expired');
//     } else {
//       logger.error('Token verification failed:', error);
//       throw new Error('Invalid token');
//     }
//   }
// };

// // === REFRESH TOKEN ===

// // Refresh token creation - make it last longer but more securely stored
// export const createRefreshToken = async (userId: string): Promise<string> => {
//   try {
//     // Use a different private key for refresh tokens
//     const refreshPrivateKeyPem = getRefreshPrivateKey();
//     const refreshPrivateKey = await importPKCS8(refreshPrivateKeyPem, 'ES256');

//     return new SignJWT({
//       userId,
//       type: 'refresh', // Explicitly mark as refresh token
//     })
//       .setProtectedHeader({ alg: 'ES256' })
//       .setIssuedAt()
//       .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRATION_TIME || '7d')
//       .setJti(crypto.randomUUID())
//       .sign(refreshPrivateKey);
//   } catch (error) {
//     logger.error('Error creating refresh token:', error);
//     throw new Error(`Failed to create refresh token: ${error.message}`);
//   }
// };

// // Refresh token verification
// export const verifyRefreshToken = async (token: string) => {
//   try {
//     const refreshPublicKeyPem = getRefreshPublicKey();
//     const refreshPublicKey = await importSPKI(refreshPublicKeyPem, 'ES256');

//     const { payload } = await jwtVerify(token, refreshPublicKey);

//     // Verify this is actually a refresh token
//     if (payload.type !== 'refresh') {
//       throw new Error('Invalid token type');
//     }

//     return payload;
//   } catch (error) {
//     logger.error('Refresh token verification failed:', error);
//     throw new Error('Invalid refresh token');
//   }
// };

// // Function to refresh an access token using a refresh token
// export const refreshAccessToken = async (refreshToken: string) => {
//   try {
//     // Verify the refresh token
//     const payload = await verifyRefreshToken(refreshToken);

//     const userId = payload.userId as string;
//     const user = await userRepository.getUserById(userId);

//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Check if refresh token is in the whitelist/database
//     const isValidRefreshToken = await tokenRefreshRepository.validateRefreshTokenInDb(
//       userId,
//       refreshToken
//     );

//     if (!isValidRefreshToken) {
//       throw new Error('Refresh token has been revoked');
//     }

//     // Create a new access token
//     return createToken({
//       userId: user.id,
//       role: user.role,
//       email: user.email,
//     });
//   } catch (error) {
//     logger.error('Failed to refresh token:', error);
//     throw new Error(`Failed to refresh token: ${error.message}`);
//   }
// };

// // Function to handle token rotation and detect token reuse
// export const rotateRefreshToken = async (oldRefreshToken: string) => {
//   try {
//     // Verify the old refresh token
//     const payload = await verifyRefreshToken(oldRefreshToken);
//     const userId = payload.userId as string;

//     // Check if token is valid in database
//     const isValid = await tokenRefreshRepository.validateRefreshTokenInDb(
//       userId,
//       oldRefreshToken
//     );

//     if (!isValid) {
//       // If token is not valid but passed verification, it might be a reuse attack
//       logger.warn('Potential refresh token reuse detected', { userId, tokenJti: payload.jti });

//       // Invalidate all refresh tokens for this user as a security measure
//       await tokenRefreshRepository.revokeAllUserRefreshTokens(userId);
//       throw new Error('Security alert: All sessions have been terminated');
//     }

//     // Create a new refresh token
//     const newRefreshToken = await createRefreshToken(userId);

//     // Invalidate the old token and store the new one
//     await tokenRefreshRepository.rotateRefreshToken(userId, oldRefreshToken, newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Set new expiration time

//     return newRefreshToken;
//   } catch (error) {
//     logger.error('Failed to rotate refresh token:', error);
//     throw new Error(`Failed to rotate refresh token: ${error.message}`);
//   }
// };

// // Function to explicitly revoke a refresh token
// export const revokeRefreshToken = async (userId: string, refreshToken: string) => {
//   try {
//     await tokenRefreshRepository.revokeRefreshToken(userId, refreshToken);
//     return true;
//   } catch (error) {
//     logger.error('Failed to revoke refresh token:', error);
//     throw new Error(`Failed to revoke token: ${error.message}`);
//   }
// };

export const createToken = async (payload: {
  userId: string
  role: string
  email: string
}): Promise<string> => {
  try {
    const privateKeyPem = config.secret.privateKey.replace(/\\n/g, '\n')
    const privateKey = await importPKCS8(privateKeyPem, 'ES256')

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
    const privateKeyPem = config.secret.privateKey.replace(/\\n/g, '\n')
    const privateKey = await importPKCS8(privateKeyPem, 'ES256')

    // Create a tokenId (jti)
    const tokenId = crypto.randomUUID()

    // Calculate expiration
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRATION_TIME || '7d'
    const expiresInMs = expiresIn.endsWith('d')
      ? parseInt(expiresIn) * 24 * 60 * 60 * 1000
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
      .sign(privateKey);

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
