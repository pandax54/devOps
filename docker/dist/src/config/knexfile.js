"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../config/index");
const path_1 = __importDefault(require("path"));
const migrationsDirectory = path_1.default.resolve(__dirname, '../database/migrations');
// directory: path.join(__dirname, '../../database/migrations')
const config = {
    development: {
        client: "postgresql",
        connection: {
            connectString: index_1.config.database.databaseUrl,
            ssl: index_1.config.database.ssl,
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
        client: "postgresql",
        connection: {
            connectString: index_1.config.database.databaseUrl,
            ssl: index_1.config.database.ssl,
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
exports.default = config;
//# sourceMappingURL=knexfile.js.map