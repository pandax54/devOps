import { Model, Pojo, snakeCaseMappers } from 'objection'
// import * as R from 'ramda'

interface IJSONTransformRules {
  omit?: string[]
  // transformations?: R.Evolver
}

export class BaseModel extends Model {
  readonly id!: string
  createdAt!: Date | string
  updatedAt!: Date | string
  deletedAt?: Date | string

  protected $transformJSON: IJSONTransformRules = {
    omit: ['deletedAt'],
  }

  // Apply snake case mappers
  static get columnNameMappers() {
    return snakeCaseMappers()
  }

  $beforeInsert() {
    this.createdAt = new Date()
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date()
  }

  // $formatJson(json: Pojo): Pojo {
  //   json = super.$formatJson(json)

  //   // if (this.$transformJSON.omit) {
  //   //   json = R.omit(this.$transformJSON.omit, json)
  //   // }

  //   // if (this.$transformJSON.transformations) {
  //   //   json = R.evolve(this.$transformJSON.transformations, json)
  //   // }

  //   return json
  // }

  // Convert Date objects to strings for the database
  $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json)

    // Convert dates to ISO strings
    if (json.createdAt instanceof Date) {
      json.createdAt = json.createdAt.toISOString()
    }
    if (json.updatedAt instanceof Date) {
      json.updatedAt = json.updatedAt.toISOString()
    }

    return json
  }

  // Convert database strings to Date objects
  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json)

    // Convert ISO strings to Date objects
    if (json.createdAt) {
      json.createdAt = new Date(json.createdAt)
    }
    if (json.updatedAt) {
      json.updatedAt = new Date(json.updatedAt)
    }

    return json
  }

  // Define relationships (still using camelCase)
  // static relationMappings: RelationMappings = {
  //   posts: {
  //     relation: Model.HasManyRelation,
  //     modelClass: Post,
  //     join: {
  //       from: 'users.id',
  //       to: 'posts.user_id'  // This will be automatically converted
  //     }
  //   }
  // };
}
