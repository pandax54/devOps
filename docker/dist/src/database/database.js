"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDatabase = exports.getDatabase = exports.checkDatabaseConnection = exports.close = exports.start = void 0;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../config/knexfile"));
const config_1 = require("../config");
let db = null;
// const db = knex(config[appConfig.environment]);
/**
 * Initialize database connection
 */
const start = async () => {
    try {
        if (db) {
            console.warn("Database connection already established");
            return;
        }
        // Create new connection
        db = (0, knex_1.default)(knexfile_1.default[config_1.config.environment]);
        console.log('config[appConfig.environment]: ', knexfile_1.default[config_1.config.environment]);
        // Test connection
        await db.raw("SELECT 1");
        console.info(`Database connection established in ${config_1.config.environment} environment`);
    }
    catch (error) {
        console.error("Failed to establish database connection:", error);
        throw new Error(`Database initialization failed: ${error.message}`);
    }
};
exports.start = start;
/**
 * Close database connection gracefully
 */
const close = async () => {
    try {
        if (!db) {
            console.log("No active database connection to close");
            return;
        }
        await db.destroy();
        db = null;
        console.log("Database connection closed successfully");
    }
    catch (error) {
        console.error("Error closing database connection:", error);
        throw new Error(`Failed to close database connection: ${error.message}`);
    }
};
exports.close = close;
const checkDatabaseConnection = async () => {
    try {
        await db.raw("SELECT 1");
        return true;
    }
    catch (error) {
        console.error("Database connection error:", error);
        return false;
    }
};
exports.checkDatabaseConnection = checkDatabaseConnection;
/**
 * Get database instance (creates connection if needed)
 */
const getDatabase = async () => {
    if (!db) {
        await (0, exports.start)();
    }
    if (!db) {
        throw new Error("Failed to get database instance");
    }
    return db;
};
exports.getDatabase = getDatabase;
/**
 * Execute query with automatic connection handling
 * Useful for one-off queries where you don't want to manage connection yourself
 */
const withDatabase = async (callback) => {
    const dbInstance = await (0, exports.getDatabase)();
    try {
        return await callback(dbInstance);
    }
    catch (error) {
        console.error("Database operation failed:", error);
        throw error;
    }
};
exports.withDatabase = withDatabase;
// Export the database instance for direct use
// but prefer using the getDatabase() or withDatabase() methods
exports.default = {
    getDatabase: exports.getDatabase,
    withDatabase: exports.withDatabase,
    start: exports.start,
    close: exports.close,
    checkDatabaseConnection: exports.checkDatabaseConnection,
    db,
};
//# sourceMappingURL=database.js.map