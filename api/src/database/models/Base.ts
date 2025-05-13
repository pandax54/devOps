import { Model, Pojo, snakeCaseMappers } from 'objection'
// import * as R from 'ramda'

interface IJSONTransformRules {
  omit?: string[]
  // transformations?: R.Evolver
}

export class BaseModel extends Model {
  readonly id!: string
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

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

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json)

    // if (this.$transformJSON.omit) {
    //   json = R.omit(this.$transformJSON.omit, json)
    // }

    // if (this.$transformJSON.transformations) {
    //   json = R.evolve(this.$transformJSON.transformations, json)
    // }

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
