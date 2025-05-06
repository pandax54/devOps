import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // First, delete existing entries
  await knex("users").del();

  // Then, insert seed entries
  await knex("users").insert([
    {
      email: "admin@example.com",
      username: "admin",
      password: "hashed_password_here",
      first_name: "Admin",
      last_name: "User",
      is_active: true
    },
    {
      email: "user@example.com",
      username: "user",
      password: "hashed_password_here",
      first_name: "Regular",
      last_name: "User",
      is_active: true
    }
  ]);
}