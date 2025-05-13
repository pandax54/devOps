import type { Knex } from "knex";
import { config as appConfig } from "./index";
import path from 'path'
import { camelizeKeys } from "@app/helper/transform";
import { snakeCase } from 'lodash';

// SQL identifiers that should NOT be converted
const PROTECTED_IDENTIFIERS = [
  '*', '??', 'NULL', 'null', 'true', 'false', 'TRUE', 'FALSE'
];

// https://gist.github.com/NigelEarle/80150ff1c50031e59b872baf0e474977

// const migrationsDirectory = path.resolve(__dirname, '../database/migrations');

// Use absolute paths for migrations and seeds
const migrationsDir = path.join(__dirname, '../../src/database/migrations');
const seedsDir = path.join(__dirname, '../../src/database/seeds');


const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    // connection: appConfig.database.databaseUrl,
    // connection: 'postgres://postgres:password@localhost:5490/database',
    connection: {
      connectionString: appConfig.database.databaseUrl,
      ssl: appConfig.database.ssl ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000
    },
    migrations: {
      tableName: "knex_migrations",
      directory: migrationsDir,
      extension: 'ts'
    },  
    seeds: {
      directory: seedsDir
    },
    postProcessResponse: (result) => {
      return camelizeKeys(result);
    },
    wrapIdentifier: (value, origImpl) => {
      // Skip conversion for special identifiers, empty strings, or SQL aliases (containing " as ")
      if (
        PROTECTED_IDENTIFIERS.includes(value) || 
        value === '' || 
        value.includes(' as ') ||
        value.includes('"') ||
        value.includes('.')  // Skip for table.column format
      ) {
        return origImpl(value);
      }
      
      // Convert camelCase to snake_case for normal identifiers
      return origImpl(snakeCase(value));
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'password',
      database: 'database_test',
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: appConfig.database.databaseUrl,
      ssl: appConfig.database.ssl ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: migrationsDir
    },
  },
};

export default config;
