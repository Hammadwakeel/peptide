import { query } from "@frontier/shared/database";
import type { User } from "@frontier/shared/database/types";

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createUser(data: {
  email: string;
  password_hash: string;
  role: User["role"];
}): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.email, data.password_hash, data.role],
  );
  return result.rows[0];
}

export async function listRoles() {
  return query("SELECT * FROM roles ORDER BY name");
}
