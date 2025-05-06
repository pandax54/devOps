import db from "@app/database/database";
import { config as appConfig } from "@app/config";

async function runMigrations() {
  console.info(`Running migrations in ${appConfig.environment} environment`);

  try {
    // Start database connection
    await db.start();

    // Get database instance
    const knexInstance = await db.getDatabase();

    // Run migrations
    const [batchNo, log] = await knexInstance.migrate.latest();

    if (log.length === 0) {
      console.info("No migrations to run");
    } else {
      console.info(`Batch ${batchNo} run: ${log.length} migrations`);
      console.info("Migrations complete");
    }

    // Run seeds if in development
    if (appConfig.environment === "development") {
      console.info("Running seeds");
      await knexInstance.seed.run();
      console.info("Seeds complete");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Migration failed:", error);
    return { success: false, error };
  } finally {
    // Always close the database connection
    await db.close();
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

export { runMigrations };

// ========================

// import path from 'path';
// import dotenv from 'dotenv';
// import knex from 'knex';

// // Load environment variables
// dotenv.config();

// async function runMigrations() {
//   // Simple connection config
//   const db = knex({
//     client: 'pg',
//     connection: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5490/database',
//     migrations: {
//       directory: path.join(__dirname, './migrations'),
//       extension: 'ts'
//     }
//   });

//   try {
//     console.log('Running migrations...');
//     const result = await db.migrate.latest();
//     console.log('Migration result:', result);
//   } catch (error) {
//     console.error('Migration failed:', error);
//   } finally {
//     await db.destroy();
//   }
// }

// runMigrations();

// ========================

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
