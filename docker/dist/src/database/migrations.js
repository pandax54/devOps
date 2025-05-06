"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const database_1 = __importDefault(require("../database/database"));
const config_1 = require("../config");
async function runMigrations() {
    console.info(`Running migrations in ${config_1.config.environment} environment`);
    try {
        // Start database connection
        await database_1.default.start();
        // Get database instance
        const knexInstance = await database_1.default.getDatabase();
        // Run migrations
        const [batchNo, log] = await knexInstance.migrate.latest();
        if (log.length === 0) {
            console.info("No migrations to run");
        }
        else {
            console.info(`Batch ${batchNo} run: ${log.length} migrations`);
            console.info("Migrations complete");
        }
        // Run seeds if in development
        if (config_1.config.environment === "development") {
            console.info("Running seeds");
            await knexInstance.seed.run();
            console.info("Seeds complete");
        }
        return { success: true };
    }
    catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error };
    }
    finally {
        // Always close the database connection
        await database_1.default.close();
    }
}
// Run as standalone script
if (require.main === module) {
    runMigrations()
        .then((result) => {
        if (!result.success) {
            process.exit(1);
        }
        process.exit(0);
    })
        .catch((error) => {
        console.error("Unhandled error in migrations:", error);
        process.exit(1);
    });
}
//
// src/scripts/create-migration.js
// const { execSync } = require('child_process');
// const path = require('path');
// const fs = require('fs');
// // Get migration name from command line
// const migrationName = process.argv[2];
// if (!migrationName) {
//   console.error('Please provide a migration name');
//   console.log('Usage: node create-migration.js migration_name');
//   process.exit(1);
// }
// // Ensure migrations directory exists
// const migrationsDir = path.resolve(__dirname, '../../database/migrations');
// if (!fs.existsSync(migrationsDir)) {
//   fs.mkdirSync(migrationsDir, { recursive: true });
// }
// try {
//   // Create timestamp for migration name
//   const timestamp = new Date().toISOString().replace(/[-:.]/g, '').split('T')[0];
//   const fileName = `${timestamp}_${migrationName}.ts`;
//   const filePath = path.join(migrationsDir, fileName);
//   // Create migration file template
//   const migrationContent = `import { Knex } from "knex";
// export async function up(knex: Knex): Promise<void> {
//   return knex.schema.createTable('${migrationName}', (table) => {
//     table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
//     // Add your columns here
//     table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
//     table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
//   });
// }
// export async function down(knex: Knex): Promise<void> {
//   return knex.schema.dropTable('${migrationName}');
// }
// `;
//   // Write migration file
//   fs.writeFileSync(filePath, migrationContent);
//   console.log(`Migration file created at: ${filePath}`);
// } catch (error) {
//   console.error('Failed to create migration:', error);
//   process.exit(1);
// }
//# sourceMappingURL=migrations.js.map