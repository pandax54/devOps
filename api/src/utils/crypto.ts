import { SignJWT, jwtVerify } from 'jose'
import { config } from '@app/config'

export const createToken = async (payload: {
  userId: string
  role: string
  email: string
}) => {
  const secretKey = new TextEncoder().encode(config.secret.secretKey)

  return (
    new SignJWT(payload) // {}
      .setProtectedHeader({ alg: config.secret.algorithm })
      .setIssuedAt()
      // .setIssuer(process.env.JWT_ISSUER) // issuer
      // .setAudience(process.env.JWT_AUDIENCE) // audience
      .setExpirationTime(config.secret.expirationTime)
      .setJti(crypto.randomUUID())
      .sign(secretKey)
  )
}

export const verifyToken = async (token: string) => {
  // extract token from request
  // const token = req.header('Authorization').replace('Bearer ', '');

  const secretKey = new TextEncoder().encode(config.secret.secretKey)

  try {
    const { payload, protectedHeader } = await jwtVerify(
      token,
      secretKey
      // { issuer: process.env.JWT_ISSUER, audience: (process.env.JWT_AUDIENCE }
    )
    return { payload, protectedHeader }
  } catch (error) {
    throw error
  }
}
