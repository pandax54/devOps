import { userRepository } from '@app/database/repositories/userRepository'
import { tokenRefreshRepository } from '@app/database/repositories/RefreshTokenRepository'
import {
  createToken,
  verifyRefreshToken,
  createRefreshToken,
} from '@app/utils/crypto-ES256'
import { comparePasswords } from '@app/utils/password'

export const login = async (email: string, password: string) => {
  const user = await userRepository.findByEmail(email)
  if (!user || !(await comparePasswords(password, user.password))) {
    throw new Error('Invalid credentials')
  }

  // Create access token (short-lived)
  const accessToken = await createToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  })

  const refreshToken = await createRefreshToken(user.id)

  // Extract jti and expiration from the refresh token
  const decodedRefreshToken = await verifyRefreshToken(refreshToken)
  const tokenId = decodedRefreshToken.jti as string
  const expiresAt = new Date((decodedRefreshToken.exp as number) * 1000)

  await tokenRefreshRepository.saveRefreshToken(user.id, tokenId, expiresAt)

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds,
    user: {
      id: user.id,
      email: user.email,
      name: user.getFullName(),
      role: user.role
    }
  }
}
