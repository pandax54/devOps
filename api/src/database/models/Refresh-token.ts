import { Model } from 'objection'
import User from './User'

export default class RefreshToken extends Model {
  static get tableName() {
    return 'refresh_tokens'
  }

  id!: string
  userId: string
  tokenId: string
  expiresAt: Date
  createdAt!: Date
  revoked: boolean
  revokedAt?: Date 

  $beforeInsert() {
    this.createdAt = new Date()
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Set expiration to 7 days from now
    this.revoked = false
  }

  $beforeUpdate() {
    this.createdAt = new Date()
  }

  // Define relationship with User model
  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'refresh_tokens.userId',
        to: 'users.id'
      }
    }
  };

  // Validation schema
  static jsonSchema = {
    type: 'object',
    required: ['userId', 'tokenId', 'expiresAt'],
    properties: {
      id: { type: 'integer' },
      userId: { type: 'string' },
      tokenId: { type: 'string' },
      expiresAt: { type: 'string', format: 'date-time' },
      revoked: { type: 'boolean' },
      revokedAt: { type: ['string', 'null'], format: 'date-time' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  };
}
