import { config } from '@app/config'
import * as bcrypt from 'bcrypt'

/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @returns A promise that resolves to the hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.secret.saltRounds)
}

/**
 * Compares a plain text password with a hashed password
 * @param plainPassword The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns A promise that resolves to true if the passwords match, false otherwise
 */
export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export const isPasswordStrong = (password: string): boolean => {
  // Minimum length
  if (password.length < 8) {
    return false
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return false
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false
  }

  return true
}
