import { hashPassword } from '@app/utils/password';
import { userRepository } from '@app/database/repositories/userRepository'
import { tokenRefreshRepository } from '@app/database/repositories/RefreshTokenRepository'


export const resetPassword = async (
  userId: string,
  newPassword: string
) => {
  
  const passwordHash = await hashPassword(newPassword);
  
  await userRepository.updateUserPassword(userId, passwordHash);
  
  // Revoke all refresh tokens for the user (security best practice)
  await tokenRefreshRepository.revokeAllUserRefreshTokens(userId);
  
  return { success: true };
};