import knex, { Knex } from "knex";
import config from "@app/config/knexfile";
import { config as appConfig } from "@app/config";

let db: Knex | null = null;
// const db = knex(config[appConfig.environment]);

/**
 * Initialize database connection
 */
export const start = async (): Promise<void> => {
  try {
    if (db) {
      console.warn("Database connection already established");
      return;
    }

    // Create new connection
    db = knex(config[appConfig.environment]);

    // Test connection
    await db.raw("SELECT 1");
    console.info(
      `Database connection established in ${appConfig.environment} environment`
    );
  } catch (error: any) {
    console.error("Failed to establish database connection:", error);
    throw new Error(`Database initialization failed: ${error.message}`);
  }
};

/**
 * Close database connection gracefully
 */
export const close = async (): Promise<void> => {
  try {
    if (!db) {
      console.log("No active database connection to close");
      return;
    }

    await db.destroy();
    db = null;
    console.log("Database connection closed successfully");
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw new Error(`Failed to close database connection: ${error.message}`);
  }
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await db.raw("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
};

/**
 * Get database instance (creates connection if needed)
 */
export const getDatabase = async (): Promise<Knex> => {
  if (!db) {
    await start();
  }

  if (!db) {
    throw new Error("Failed to get database instance");
  }

  return db;
};

/**
 * Execute query with automatic connection handling
 * Useful for one-off queries where you don't want to manage connection yourself
 */
export const withDatabase = async <T>(
  callback: (dbInstance: Knex) => Promise<T>
): Promise<T> => {
  const dbInstance = await getDatabase();
  try {
    return await callback(dbInstance);
  } catch (error: any) {
    console.error("Database operation failed:", error);
    throw error;
  }
};

// Export the database instance for direct use
// but prefer using the getDatabase() or withDatabase() methods
export default {
  getDatabase,
  withDatabase,
  start,
  close,
  checkDatabaseConnection,
  db,
};
