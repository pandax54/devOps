import BaseRepository from './BaseRepository';
import User from '../models/User';
export default class UserRepository extends BaseRepository<User> {
    constructor();
    findByEmail(email: string): Promise<User | undefined>;
    findWithPosts(id: string): Promise<User | undefined>;
    findActiveUsers(): Promise<User[]>;
    deactivateUser(id: string): Promise<User | undefined>;
    createUserWithPosts(userData: Partial<User>, posts: Array<{
        title: string;
        content: string;
    }>): Promise<User>;
}
