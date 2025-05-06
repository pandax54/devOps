import knex, { Knex } from "knex";
/**
 * Initialize database connection
 */
export declare const start: () => Promise<void>;
/**
 * Close database connection gracefully
 */
export declare const close: () => Promise<void>;
export declare const checkDatabaseConnection: () => Promise<boolean>;
/**
 * Get database instance (creates connection if needed)
 */
export declare const getDatabase: () => Promise<Knex>;
/**
 * Execute query with automatic connection handling
 * Useful for one-off queries where you don't want to manage connection yourself
 */
export declare const withDatabase: <T>(callback: (dbInstance: Knex) => Promise<T>) => Promise<T>;
declare const _default: {
    getDatabase: () => Promise<Knex>;
    withDatabase: <T>(callback: (dbInstance: Knex) => Promise<T>) => Promise<T>;
    start: () => Promise<void>;
    close: () => Promise<void>;
    checkDatabaseConnection: () => Promise<boolean>;
    db: knex.Knex<any, any[]>;
};
export default _default;
