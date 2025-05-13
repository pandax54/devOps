import type { Knex } from "knex";
import { createStandardTable } from "@app/helper/migration";


export async function up(knex: Knex): Promise<void> {
  return createStandardTable(knex, "refresh_tokens", (table) => {
    table.string("user_id").notNullable();
    table.string("token_id").notNullable().unique(); // Store the jti claim
    table.timestamp("expires_at").notNullable();
    table.boolean("revoked").defaultTo(false);
    table.timestamp('revoked_at').nullable();

    table.index("user_id");
    table.index("token_id");
  });
  
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("refresh_tokens");
}


// CREATE TABLE refresh_tokens (
//   id SERIAL PRIMARY KEY,
//   user_id VARCHAR(255) NOT NULL,
//   token_id VARCHAR(255) NOT NULL, -- Store the jti claim
//   expires_at TIMESTAMP NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   revoked BOOLEAN DEFAULT FALSE,
//   UNIQUE(token_id)
// );

// -- Add index for faster lookups
// CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
// CREATE INDEX idx_refresh_tokens_token_id ON refresh_tokens(token_id);