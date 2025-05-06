import { Model, QueryBuilder } from "objection";
import { Knex } from "knex";

export default class BaseRepository<T extends Model> {
  protected model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }

  async findById(id: string, trx?: Knex.Transaction): Promise<T | undefined> {
    return this.model.query(trx).findById(id).select("*") as unknown as Promise<
      T | undefined
    >;
  }

  // Find all records with optional filtering, pagination, and sorting
  async findAll(
    {
      filters = {},
      page = 1,
      pageSize = 20,
      orderBy = "created_at",
      orderDirection = "desc",
    }: {
      filters?: Record<string, any>;
      page?: number;
      pageSize?: number;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
    } = {},
    trx?: Knex.Transaction
  ): Promise<{ data: T[]; total: number }> {
    // Create base query
    let query = this.model.query(trx) as QueryBuilder<T, T[]>;

    // Apply filters
    if (Object.keys(filters).length > 0) {
      query = query.where(filters);
    }

    // Get total count (before pagination)
    const total = await query.clone().resultSize();

    // Apply pagination and sorting
    // The Page<T> object from Objection.js includes a results property that contains your actual data. You need to adjust your code to handle this structure:
    // query = query.orderBy(orderBy, orderDirection).page(page - 1, pageSize); -> Page<T>
    // data: result.results, / Extract the actual array from the Page object

    query = query
      .orderBy(orderBy, orderDirection)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    // Execute query
    const result = await query;

    return {
      data: result,
      total,
    };
  }

  // Create a new record
  async create(data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    return this.model.query(trx).insert(data) as unknown as Promise<T>;
  }

  // Update a record by id
  async update(
    id: string,
    data: Partial<T>,
    trx?: Knex.Transaction
  ): Promise<T | undefined> {
    const updated = await this.model.query(trx).updateAndFetchById(id, data);

    return updated as T | undefined;
  }

  // Delete a record by id
  async delete(id: string, trx?: Knex.Transaction): Promise<boolean> {
    const deleted = await this.model.query(trx).deleteById(id);

    return deleted > 0;
  }

  // Run a transaction
  async transaction<TResult>(
    callback: (trx: Knex.Transaction) => Promise<TResult>
  ): Promise<TResult> {
    return this.model.transaction(callback);
  }
}
