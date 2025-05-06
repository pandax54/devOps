"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findById(id, trx) {
        return this.model.query(trx).findById(id).select("*");
    }
    // Find all records with optional filtering, pagination, and sorting
    async findAll({ filters = {}, page = 1, pageSize = 20, orderBy = "created_at", orderDirection = "desc", } = {}, trx) {
        // Create base query
        let query = this.model.query(trx);
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
    async create(data, trx) {
        return this.model.query(trx).insert(data);
    }
    // Update a record by id
    async update(id, data, trx) {
        const updated = await this.model.query(trx).updateAndFetchById(id, data);
        return updated;
    }
    // Delete a record by id
    async delete(id, trx) {
        const deleted = await this.model.query(trx).deleteById(id);
        return deleted > 0;
    }
    // Run a transaction
    async transaction(callback) {
        return this.model.transaction(callback);
    }
}
exports.default = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map