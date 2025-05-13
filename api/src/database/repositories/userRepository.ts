import BaseRepository from './BaseRepository'
import User from '../models/User'

class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User)
  }

  async getUserById(id: string): Promise<User | undefined> {
    return User.query().findById(id)
  }

  // Example of a custom finder method
  async findByEmail(email: string): Promise<User | undefined> {
    return User.query().findOne({ email }) as unknown as Promise<User | undefined>
  }

  // Example of a more complex query
  async findActiveUsers(): Promise<User[]> {
    return User.query().where('isActive', true).orderBy('createdAt', 'desc')
  }

  // Example of a custom update method
  async deactivateUser(id: string): Promise<User | undefined> {
    return this.update(id, { is_active: false } as Partial<User>)
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return User.query()
      .insert(userData)
      .returning(['id', 'firstName', 'lastName', 'email', 'role'])
  }

  async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<User | undefined> {
    return User.query().patchAndFetchById(userId, { password: newPassword })
  }
}

export const userRepository = new UserRepository()
