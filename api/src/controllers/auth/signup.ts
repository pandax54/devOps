import authService from '@app/services/auth'
import { tokenRefreshRepository } from '@app/database/repositories/RefreshTokenRepository'
import { createToken, createRefreshToken } from '@app/utils/crypto-ES256'
import { config } from '@app/config'
import ms from 'ms'

// add body request validation
export const signup = async (ctx: AppContext) => {
  try {
    const { email, password, firstName, lastName, username } = ctx.request.body

    const createUser = await authService.registerUser({
      email,
      username,
      password,
      firstName,
      lastName,
    })

    // create token and refresh token
    const accessToken = await createToken({
      userId: createUser.id,
      role: createUser.role,
      email: createUser.email,
    })

    const refreshToken = await createRefreshToken(createUser.id)

    // Parse the expiration time string (e.g., "7d") directly to milliseconds
    const expiresInMs = ms(config.secret.tokenExpirationTime as ms.StringValue)
    const expiresAt = new Date(Date.now() + expiresInMs)

    await tokenRefreshRepository.saveRefreshToken(
      createUser.id,
      refreshToken,
      expiresAt
    )

    ctx.status = 201

    ctx.body = {
      message: 'User created successfully',
      user: {
        // username: createUser.username,
        email: createUser.email,
        name: createUser.name,
        role: createUser.role,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
    }
  } catch (error) {
    console.error('Error during signup:', error)
    ctx.status = 401
    ctx.json({ error })
  }
}
