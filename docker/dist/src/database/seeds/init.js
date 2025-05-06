"use strict";
// 1. Creating a New Migration
// Run this command to create a new migration file:
// npm run migrate:make -- create_users_table
// The double dash (--) is necessary to pass arguments to the underlying command
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
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
//# sourceMappingURL=init.js.map