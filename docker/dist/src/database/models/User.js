"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
class User extends objection_1.Model {
    id;
    username;
    password;
    first_name;
    last_name;
    email;
    is_active;
    created_at;
    updated_at;
    // Add automatic timestamp management
    $beforeInsert() {
        this.created_at = new Date();
        this.updated_at = new Date();
    }
    $beforeUpdate() {
        this.updated_at = new Date();
    }
    // Optional: Add validation
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['created_at', 'updated_at'],
            properties: {
                id: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }
}
exports.default = User;
// // src/models/User.ts
// import BaseModel from './BaseModel';
// import Post from './Post'; // For relation example
// export default class User extends BaseModel {
//   static get tableName() {
//     return 'users';
//   }
//   // Define properties
//   email!: string;
//   username!: string;
//   password_hash!: string;
//   first_name?: string;
//   last_name?: string;
//   is_active: boolean = true;
//   // Define relations
//   static get relationMappings() {
//     return {
//       posts: {
//         relation: BaseModel.HasManyRelation,
//         modelClass: Post,
//         join: {
//           from: 'users.id',
//           to: 'posts.user_id'
//         }
//       }
//     };
//   }
//   // Add validation schema
//   static get jsonSchema() {
//     return {
//       type: 'object',
//       required: ['email', 'username', 'password_hash'],
//       properties: {
//         id: { type: 'string' },
//         email: { type: 'string', format: 'email' },
//         username: { type: 'string', minLength: 2, maxLength: 30 },
//         password_hash: { type: 'string' },
//         first_name: { type: ['string', 'null'] },
//         last_name: { type: ['string', 'null'] },
//         is_active: { type: 'boolean' },
//         created_at: { type: 'string', format: 'date-time' },
//         updated_at: { type: 'string', format: 'date-time' }
//       }
//     };
//   }
//   // Add custom methods
//   getFullName(): string {
//     if (this.first_name && this.last_name) {
//       return `${this.first_name} ${this.last_name}`;
//     }
//     return this.username;
//   }
// }
//# sourceMappingURL=User.js.map