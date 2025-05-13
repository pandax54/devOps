import { BaseModel } from './Base'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export default class User extends BaseModel {
  static get tableName() {
    return 'users'
  }

  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean

  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`
    }
    return this.username
  }

  // https://vincit.github.io/objection.js/guide/models.html#examples
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['password', 'email', 'username'],
      properties: {
        password: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
      },
    }
  }
}
