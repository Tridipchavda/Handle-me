import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';

let pool: Pool | null = null;

// Initialize pool only on server side
if (typeof window === 'undefined') {
  const connectionString = process.env.DATABASE_URL || 'postgresql://handle_me_user:handle_me_password@localhost:5432/handle_me_db';
  pool = new Pool({
    connectionString,
    ssl: false
  });
}

export async function POST(request: Request) {
  if (!pool) {
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 500 }
    );
  }

  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT * FROM "User" WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user
      const result = await client.query(
        `INSERT INTO "User" (id, email, username, password, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, email, username`,
        [email, username, hashedPassword]
      );

      const newUser = result.rows[0];

      return NextResponse.json(
        {
          message: 'User created successfully',
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
          },
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 