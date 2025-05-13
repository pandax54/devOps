import { hashPassword, isPasswordStrong } from '@app/utils/password'
import { userRepository } from '@app/database/repositories/userRepository'

export const registerUser = async (payload: {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
  role?: string
}) => {

  const { email, password, firstName, lastName, username, role } = payload

  // Validate email format
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error('Invalid email format')
  }

  // Check password strength
  if (!isPasswordStrong(password)) {
    throw new Error(
      'Password must be at least 8 characters long and contain uppercase, ' +
        'lowercase, number, and special character'
    )
  }

  const existingUser = await userRepository.findByEmail(email)
  console.log('Existing user:', existingUser)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await hashPassword(password)

  console.log('createUser')
  const user = await userRepository.createUser({
    email,
    username,
    password: passwordHash,
    firstName: firstName,
    lastName: lastName,
    role: role ?? 'user',
  })

  return {
    id: user.id,
    email: user.email,
    name: user.getFullName(),
    role: user.role,
  }
}
