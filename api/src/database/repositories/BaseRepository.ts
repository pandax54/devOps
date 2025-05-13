import { Model, QueryBuilder, Transaction, PartialModelObject } from 'objection';
import { Knex } from 'knex';
import { logger } from '@app/utils/logger';

export default class BaseRepository<T extends Model> {
  protected model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }

  /**
   * Get the model's query builder, optionally with a transaction
   */
  protected getQuery(trx?: Transaction | Knex.Transaction): QueryBuilder<T, T[]> {
    return (trx ? this.model.query(trx) : this.model.query()) as QueryBuilder<T, T[]>;
  }

  /**
   * Find a record by ID
   */
  async findById(id: string | number, trx?: Transaction | Knex.Transaction): Promise<T | undefined> {
    return this.getQuery(trx).findById(id) as unknown as Promise<T | undefined>;
  }

  /**
   * Find all records
   */
  async findAll(trx?: Transaction | Knex.Transaction): Promise<T[]> {
    return this.getQuery(trx) as unknown as Promise<T[]>;
  }

  /**
   * Create a new record
   */
  async create(data: PartialModelObject<T>, trx?: Transaction | Knex.Transaction): Promise<T> {
    return this.getQuery(trx).insert(data) as unknown as Promise<T>;
  }

  /**
   * Create multiple records
   */
  async createMany(data: PartialModelObject<T>[], trx?: Transaction | Knex.Transaction): Promise<T[]> {
    return this.getQuery(trx).insert(data) as unknown as Promise<T[]>;
  }

  /**
   * Update a record by ID
   */
  async update(id: string | number, data: PartialModelObject<T>, trx?: Transaction | Knex.Transaction): Promise<T | undefined> {
    return this.getQuery(trx).patchAndFetchById(id, data) as unknown as Promise<T | undefined>;
  }

  /**
   * Delete a record by ID (soft delete if model has deletedAt)
   */
  async delete(id: string | number, trx?: Transaction | Knex.Transaction): Promise<number> {
    // Check if model has deletedAt property for soft delete
    const modelInstance = new (this.model as any)();
    if ('deletedAt' in modelInstance) {
      return this.getQuery(trx).patch({ deletedAt: new Date() } as unknown as PartialModelObject<T>).where('id', id);
    } else {
      return this.getQuery(trx).deleteById(id);
    }
  }

  /**
   * Get the query builder
   */
  query(trx?: Transaction | Knex.Transaction): QueryBuilder<T, T[]> {
    return this.getQuery(trx);
  }

  /**
   * Run operations within a transaction
   */
  async transaction<R>(
    callback: (trx: Transaction) => Promise<R>
  ): Promise<R> {
    return this.model.transaction(async (trx) => {
      try {
        const result = await callback(trx);
        return result;
      } catch (error) {
        logger.error('Transaction failed:', error);
        throw error;
      }
    });
  }

  /**
   * Find records by a field value
   */
  async findBy(field: string, value: any, trx?: Transaction | Knex.Transaction): Promise<T[]> {
    return this.getQuery(trx).where(field, value) as unknown as Promise<T[]>;
  }

  /**
   * Find one record by a field value
   */
  async findOneBy(field: string, value: any, trx?: Transaction | Knex.Transaction): Promise<T | undefined> {
    return this.getQuery(trx).where(field, value).first() as unknown as Promise<T | undefined>;
  }

  /**
   * Find records with pagination
   */
  async findWithPagination(
    page: number = 1,
    pageSize: number = 10,
    trx?: Transaction | Knex.Transaction
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number; pageCount: number }> {
    const query = this.getQuery(trx);
    
    // Get results with pagination
    const result = await query.page(page - 1, pageSize);
    
    return {
      data: result.results as unknown as T[],
      total: result.total,
      page: page,
      pageSize: pageSize,
      pageCount: Math.ceil(result.total / pageSize)
    };
  }

  /**
   * Get database instance to use raw queries if needed
   */
  getKnex(): Knex {
    return this.model.knex();
  }
}
