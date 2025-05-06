// // src/repositories/PostRepository.ts
// import BaseRepository from './BaseRepository';
// import Post from '../models/Post';

// export default class PostRepository extends BaseRepository<Post> {
//   constructor() {
//     super(Post);
//   }

//   // Find posts by user
//   async findByUserId(userId: string): Promise<Post[]> {
//     return Post.query()
//       .where('user_id', userId)
//       .orderBy('created_at', 'desc');
//   }

//   // Find published posts
//   async findPublished(): Promise<Post[]> {
//     return Post.query()
//       .where('is_published', true)
//       .orderBy('created_at', 'desc');
//   }

//   // Find posts with author
//   async findWithAuthor(id: string): Promise<Post | undefined> {
//     return Post.query()
//       .findById(id)
//       .withGraphFetched('author');
//   }

//   // Publish a post
//   async publish(id: string): Promise<Post | undefined> {
//     return this.update(id, { is_published: true } as Partial<Post>);
//   }
// }
