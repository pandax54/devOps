import { Knex } from 'knex';

export function addStandardColumns(knex: Knex, table: Knex.CreateTableBuilder): void {
  table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
  table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  table.timestamp('deleted_at').nullable();
}

export async function createStandardTable(
  knex: Knex, 
  tableName: string, 
  columnCallback: (table: Knex.CreateTableBuilder) => void
): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  return knex.schema.createTable(tableName, (table) => {
    // Add standard columns
    addStandardColumns(knex, table);
    
    // Add custom columns
    columnCallback(table);
  });
}