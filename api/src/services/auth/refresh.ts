import { createToken, verifyRefreshToken, createRefreshToken } from '@app/utils/crypto-ES256'
import { tokenRefreshRepository } from '@app/database/repositories/RefreshTokenRepository'
import { getDatabase } from '@app/database/database';
import User from '@app/database/models/User';

// When refreshing, issue a new refresh token and invalidate the old one
export const refresh = async (refreshToken: string, user: User) => {
  // Verify the old refresh token
  const decodedOld = await verifyRefreshToken(refreshToken);
  const userId = decodedOld.userId as string;
  const oldTokenId = decodedOld.jti as string;
  
  const accessToken = await createToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  }); 
  
  // Create new refresh token
  const newRefreshToken = await createRefreshToken(userId);
  const decodedNew = await verifyRefreshToken(newRefreshToken);
  const newTokenId = decodedNew.jti as string;
  const expiresAt = new Date((decodedNew.exp as number) * 1000);
  
  // Save new refresh token and invalidate old one (in a transaction)
  const db = await getDatabase();
  await db.transaction(async (tx) => {
    await tokenRefreshRepository.revokeRefreshToken(userId, oldTokenId);
    await tokenRefreshRepository.saveRefreshToken(userId, newTokenId, expiresAt);
  });
  
  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600
  };
};