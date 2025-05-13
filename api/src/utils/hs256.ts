import { SignJWT, jwtVerify } from 'jose';
import { logger } from './logger';

// Use a secure secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const createToken = async (payload: {
  userId: string;
  role: string;
  email: string;
}): Promise<string> => {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setJti(crypto.randomUUID())
      .sign(secretKey);
  } catch (error) {
    logger.error('Error creating token:', error);
    throw new Error(`Failed to create authentication token: ${error.message}`);
  }
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    logger.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
};