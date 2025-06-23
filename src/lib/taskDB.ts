import { Pool } from 'pg';

let pool: Pool | null = null;

// Initialize pool only on server side
if (typeof window === 'undefined') {
  const connectionString = process.env.DATABASE_URL || 'postgresql://handle_me_user:handle_me_password@localhost:5432/handle_me_db';
  pool = new Pool({
    connectionString,
    ssl: false
  });
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database queries can only be executed on the server side');
  }
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Task queries
export async function getTasksByUserId(userId: string) {
  const result = await query('SELECT * FROM "Task" WHERE "userId" = $1', [userId]);
  return result.rows;
}

export async function createTask(title: string, description: string, label: string, userId: string) {
  const result = await query(
    `INSERT INTO "Task" (id, title, description, label, "userId", "createdAt", "updatedAt") 
                VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
    [title, description, label, userId]
  );
  return result.rows[0];
}

export async function updateTask(id: string, updates: any) {
  const setClause = Object.keys(updates)
    .map((key, index) => `"${key}" = $${index + 2}`)
    .join(', ');
  const values = Object.values(updates);
  
  const result = await query(
    `UPDATE "Task" SET ${setClause}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
}

export async function deleteTask(id: string) {
  const result = await query('DELETE FROM "Task" WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
} 