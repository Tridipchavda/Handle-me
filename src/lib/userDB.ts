import { query } from "./taskDB";

// User queries
export async function findUserByEmail(email: string) {
    const result = await query('SELECT * FROM "User" WHERE email = $1', [email]);
    return result.rows[0];
  }
  
  export async function findUserByUsername(username: string) {
    const result = await query('SELECT * FROM "User" WHERE username = $1', [username]);
    return result.rows[0];
  }
  
  export async function createUser(email: string, username: string, password: string) {
    const result = await query(
      'INSERT INTO "User" (id, email, username, password, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING *',
      [email, username, password]
    );
    return result.rows[0];
  }