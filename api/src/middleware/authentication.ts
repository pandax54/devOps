import { Next } from 'koa'
import { UnauthorizedError } from '@app/errors'
import { getBearerToken, verifyToken } from '@app/utils/crypto-ES256'
import { userRepository } from '@app/database/repositories/userRepository'
import { logger } from '@app/utils/logger'

export const authentication = async (ctx: AppContext, next: Next) => {
  const token = getBearerToken(ctx.headers.authorization)

  if (!token) {
    logger.warn({ headers: ctx.headers }, 'Auth: Invalid authorization')
    throw new UnauthorizedError()
  }

  let payload
  try {
    payload = await verifyToken(token)
  } catch (err) {
    logger.warn({ err }, 'Auth: Jwt failed to verify')
    throw new UnauthorizedError()
  }

  const userRepo = userRepository
  const user = await userRepo.findByEmail(payload.email)

  if (!user) {
    throw new UnauthorizedError()
  }

  ctx.user = user

  await next()
}