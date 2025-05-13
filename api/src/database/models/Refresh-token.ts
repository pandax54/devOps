import User from './User'
import { BaseModel } from './Base'
import { Model } from 'objection'

export default class RefreshToken extends BaseModel {
  static get tableName() {
    return 'refresh_tokens'
  }

  userId: string
  tokenId: string
  expiresAt: string | Date;
  revoked: boolean
  revokedAt?: Date | string

  $beforeInsert() {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Set expiration to 7 days from now
    this.revoked = false
  }

  $beforeUpdate() {
    super.$beforeUpdate()
    // this.createdAt = new Date()
  }

  // Convert Date objects to strings when serializing to database
  $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json)

    // Special handling for Date objects - convert to database format
    if (json.expiresAt instanceof Date) {
      json.expiresAt = json.expiresAt.toISOString()
    }
    if (json.revokedAt instanceof Date) {
      json.revokedAt = json.revokedAt.toISOString()
    }

    return json
  }

  // Convert strings back to Date objects when deserializing from database
  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json)

    // Special handling for date strings - convert to Date objects
    if (json.expiresAt) {
      json.expiresAt = new Date(json.expiresAt)
    }
    if (json.revokedAt) {
      json.revokedAt = new Date(json.revokedAt)
    }

    return json
  }

  // Validation schema - this is what Objection.js uses for validation
  static jsonSchema = {
    type: 'object',
    required: ['userId', 'tokenId', 'expiresAt'],
    properties: {
      id: { type: 'integer' },
      userId: { type: 'string' },
      tokenId: { type: 'string' },
      expiresAt: { type: 'string', format: 'date-time' }, // Format as date-time string for validation
      revoked: { type: 'boolean' },
      revokedAt: { type: ['string', 'null'], format: 'date-time' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  }

  // Define relationship with User model
  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'refresh_tokens.userId',
        to: 'users.id',
      },
    },
  }
}
