import type { Knex } from "knex";
import { config as appConfig } from "../config/index";
import path from 'path'

// https://gist.github.com/NigelEarle/80150ff1c50031e59b872baf0e474977

const migrationsDirectory = path.resolve(__dirname, '../database/migrations');
// directory: path.join(__dirname, '../../database/migrations')


const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    // connection: appConfig.database.databaseUrl,
    connection: {
      connectionString: appConfig.database.databaseUrl,
      ssl: appConfig.database.ssl ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: migrationsDirectory,
      extension: 'ts'
    },
    seeds: {
      directory: '../database/seeds'
    }
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
      directory: migrationsDirectory
    },
  },
};

export default config;
