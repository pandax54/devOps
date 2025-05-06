// 1. Creating a New Migration
// Run this command to create a new migration file:
// npm run migrate:make -- create_users_table
// The double dash (--) is necessary to pass arguments to the underlying command

// This will create a new migration file in your migrations directory:
// database/migrations/YYYYMMDDHHMMSS_create_users_table.ts

// 2. Example Migration File
// The generated migration file will look like this:
// ---------------------------------------------------
// File: database/migrations/YYYYMMDDHHMMSS_create_users_table.ts

import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').notNullable().unique();
    table.string('username').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('first_name');
    table.string('last_name');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}

// 3. Running Migrations
// To run all pending migrations:
// npm run migrate:latest

// To rollback the most recent batch of migrations:
// npm run migrate:rollback

// To rollback all migrations:
// npm run migrate:rollback:all

// To list all completed migrations:
// npm run migrate:list

// 4. Creating and Running Seeds
// Create a seed file:
// npm run seed:make -- initial_users

// Run all seed files:
// npm run seed:run

// 5. Production Deployment
// Before deployment:
// 1. Compile TypeScript to JavaScript
// 2. Run migrations using the compiled JavaScript files:
//    npm run migrate:latest:prod