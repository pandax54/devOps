import type { Knex } from "knex";
import { createStandardTable } from "@app/helper/migration";

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if using PostgreSQL
  // await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // return knex.schema.createTableIfNotExists("users", function (table) {
  //   // table.increments("id"); // uuid
  //   table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
  //   table.string("password").notNullable();
  //   table.string("username", 255).notNullable().unique();
  //   table.string("first_name", 255).notNullable();
  //   table.string("last_name", 255);
  //   table.string("email", 255).notNullable();
  //   table.boolean("is_active").notNullable().defaultTo(true);

  //   // Standard timestamp columns
  //   table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  //   table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  //   table.timestamp('deleted_at').nullable();
  // });

  return createStandardTable(knex, "users", (table) => {
    table.string("username", 255).notNullable().unique();
    table.string("email", 255).notNullable().unique();
    table.string("first_name", 255).notNullable();
    table.string("last_name", 255);
    table.string("role", 255).defaultTo("user");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.string("password").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("users");
}
