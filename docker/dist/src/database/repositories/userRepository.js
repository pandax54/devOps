"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/repositories/UserRepository.ts
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
const User_1 = __importDefault(require("../models/User"));
class UserRepository extends BaseRepository_1.default {
    constructor() {
        super(User_1.default);
    }
    // Example of a custom finder method
    async findByEmail(email) {
        return User_1.default.query()
            .where('email', email)
            .first();
    }
    // Example of using relations
    async findWithPosts(id) {
        return User_1.default.query()
            .findById(id)
            .withGraphFetched('posts');
    }
    // Example of a more complex query
    async findActiveUsers() {
        return User_1.default.query()
            .where('is_active', true)
            .orderBy('created_at', 'desc');
    }
    // Example of a custom update method
    async deactivateUser(id) {
        return this.update(id, { is_active: false });
    }
    // Example of transaction usage
    async createUserWithPosts(userData, posts) {
        return this.transaction(async (trx) => {
            // Create user
            const user = await User_1.default.query(trx).insert(userData);
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
exports.default = UserRepository;
//# sourceMappingURL=userRepository.js.map