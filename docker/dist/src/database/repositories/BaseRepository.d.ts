import { Model } from "objection";
import { Knex } from "knex";
export default class BaseRepository<T extends Model> {
    protected model: typeof Model;
    constructor(model: typeof Model);
    findById(id: string, trx?: Knex.Transaction): Promise<T | undefined>;
    findAll({ filters, page, pageSize, orderBy, orderDirection, }?: {
        filters?: Record<string, any>;
        page?: number;
        pageSize?: number;
        orderBy?: string;
        orderDirection?: "asc" | "desc";
    }, trx?: Knex.Transaction): Promise<{
        data: T[];
        total: number;
    }>;
    create(data: Partial<T>, trx?: Knex.Transaction): Promise<T>;
    update(id: string, data: Partial<T>, trx?: Knex.Transaction): Promise<T | undefined>;
    delete(id: string, trx?: Knex.Transaction): Promise<boolean>;
    transaction<TResult>(callback: (trx: Knex.Transaction) => Promise<TResult>): Promise<TResult>;
}
