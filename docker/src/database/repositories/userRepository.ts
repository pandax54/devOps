// src/repositories/UserRepository.ts
import BaseRepository from './BaseRepository';
import User from '../models/User';

export default class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  // Example of a custom finder method
  async findByEmail(email: string): Promise<User | undefined> {
    return User.query()
      .where('email', email)
      .first();
  }

  // Example of using relations
  async findWithPosts(id: string): Promise<User | undefined> {
    return User.query()
      .findById(id)
      .withGraphFetched('posts');
  }

  // Example of a more complex query
  async findActiveUsers(): Promise<User[]> {
    return User.query()
      .where('is_active', true)
      .orderBy('created_at', 'desc');
  }

  // Example of a custom update method
  async deactivateUser(id: string): Promise<User | undefined> {
    return this.update(id, { is_active: false } as Partial<User>);
  }

  // Example of transaction usage
  async createUserWithPosts(userData: Partial<User>, posts: Array<{ title: string; content: string }>): Promise<User> {
    return this.transaction(async (trx) => {
      // Create user
      const user = await User.query(trx).insert(userData);
      
      // Create posts with user relationship
      if (posts.length > 0) {
        const postsWithUserId = posts.map(post => ({
          ...post,
          user_id: user.id
        }));
        
        await user.$relatedQuery('posts', trx).insert(postsWithUserId);
      }
      
      // Return user with posts
      return user.$query(trx).withGraphFetched('posts');
    });
  }
}